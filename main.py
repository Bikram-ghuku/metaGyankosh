from typing_extensions import List, TypedDict
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langgraph.graph import START, StateGraph
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate


class State(TypedDict):
    question: str
    context: List[Document]
    answer: str
load_dotenv()

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = Chroma(
    collection_name="BOOKS",
    persist_directory="./chroma_store",
    embedding_function=embeddings
)

llm = ChatGroq(temperature=0, model="llama-3.1-8b-instant")
prompt = PromptTemplate.from_template("""
    You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. 
    Do not write generic answer and only give answer based on the context else say dont know.
    Use ten sentences maximum and keep the answer concise and to the point. If you don't know the answer, just say that you don't know and do not give other answer.

    Question: {question}  
    Context: {context}  
    Answer:
""")

# Define application steps
def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}


# Compile application and test
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

if __name__ == "__main__":
    while True:
        response = graph.invoke({"question": input("> ")})
        print(response["answer"])