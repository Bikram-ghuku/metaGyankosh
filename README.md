# LangGraph metaKGP RAG

A Retrieval-Augmented Generation (RAG) system built using [LangGraph](https://github.com/langchain-ai/langgraph), designed to answer queries using content scraped from the [metaKGP wiki](https://wiki.metakgp.org/). This project demonstrates a complete pipeline from data scraping to vector storage, retrieval, and LLM-powered response generation.

---

## Features

- Scrapes wiki pages from metaKGP
- Converts documents into embeddings using HuggingFace Embeddings.
- Stores vectors in ChromaDB for fast retrieval.
- Uses LangGraph to build a RAG pipeline.
- Generates answers using a language model based on retrieved context.

---

## Project Structure

```
langgraph_rag/
├── allLinks.json         # Extracted links from metaKGP
├── chroma_store/         # Chroma vector DB storage
├── main.py               # LangGraph pipeline (retrieval + generation)
├── vector_gen.py         # Embedding generation and DB population
├── wiki_scrape.py        # Crawler for metaKGP wiki
├── requirements.txt      # Dependencies
└── README.md             # Project documentation
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
    git clone https://github.com/Bikram-ghuku/langgraph_rag.git
    cd langgraph_rag
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Environment Variables

You’ll need an groq api key for embedding and LLM generation.

```bash
    cp .env.example .env
```
Fill the env vars as needed

---

## Usage

### Step 1: Scrape the metaKGP Wiki

```bash
python wiki_scrape.py
```

### Step 2: Generate Vector Embeddings

```bash
python vector_gen.py
```

### Step 3: Query with LangGraph

```bash
python main.py
```

You’ll be prompted to enter a question. The system will retrieve relevant wiki information and generate a response.

---

## Powered By

- [LangGraph](https://github.com/langchain-ai/langgraph)
- [LangChain](https://github.com/langchain-ai/langchain)
- [ChromaDB](https://github.com/chroma-core/chroma)
- [OpenAI Embeddings & LLMs](https://platform.openai.com/)
- [metaKGP wiki](https://wiki.metakgp.org/)

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

Special thanks to the metaKGP community and the LangChain team for building powerful open-source tools.