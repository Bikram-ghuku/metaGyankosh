from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing_extensions import List, TypedDict
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langgraph.graph import StateGraph
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
import asyncio

# Load environment
load_dotenv()

# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    user_id: str = None

class QuestionResponse(BaseModel):
    answer: str
    user_id: str = None

class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RAG components
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vector_store = Chroma(
    collection_name="BOOKS",
    persist_directory="./chroma_store",
    embedding_function=embeddings
)
llm = ChatGroq(temperature=0, model="llama-3.1-8b-instant")
prompt = PromptTemplate.from_template("""
    You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
    Do not write generic answer and only give answer based on the context else say don't know.
    Use ten sentences maximum and keep the answer concise and to the point. If you don't know the answer, just say that you don't know and do not give other answer.

    Question: {question}  
    Context: {context}  
    Answer:
""")

# RAG steps
def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

# LangGraph setup
graph_builder = StateGraph(State)
graph_builder.add_node("retrieve", retrieve)
graph_builder.add_node("generate", generate)
graph_builder.set_entry_point("retrieve")
graph_builder.add_edge("retrieve", "generate")
graph = graph_builder.compile()

# Blocking logic
def process_question(question: str, user_id: str = None):
    response = graph.invoke({"question": question})
    return {"answer": response["answer"], "user_id": user_id}

# Async endpoint
@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        result = await asyncio.to_thread(process_question, request.question, request.user_id)
        return QuestionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
