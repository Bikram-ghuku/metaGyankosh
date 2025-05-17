import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
from langchain_community.document_loaders import WebBaseLoader
import nest_asyncio


chunks = ""
# with open("reddit_all_messages_and_replies_1.txt", "r") as f:
#     documents.append(f.read())

MAX_LINKS = 50

with open("allLinks.json", "r") as f:
    links = json.load(f)
    loader = WebBaseLoader(links[:MAX_LINKS])
    loader.requests_per_second = 5
    documents = loader.aload()
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(documents)

print(f"Split into {len(chunks)} chunks.")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

chroma_dir = "./chroma_store"
vectorstore = Chroma.from_documents(
    collection_name="BOOKS",
    documents=chunks,
    embedding=embeddings,
    persist_directory=chroma_dir
)

vectorstore.persist()

print(f"📦 Chroma DB saved to {chroma_dir}")