import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

all_urls = set()

urls = [
    "https://wiki.metakgp.org/w/Main_Page",
    "https://wiki.metakgp.org/w/Category:Halls_of_Residence",
    "https://wiki.metakgp.org/w/Category:Food_and_Beverages",
    "https://wiki.metakgp.org/w/Category:Academics",
    "https://wiki.metakgp.org/w/Category:Departments",
    "https://wiki.metakgp.org/w/Category:Societies_and_clubs",
    "https://wiki.metakgp.org/w/List_of_how-tos",
]

for url in urls:
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.find_all("a")
        for link in links:
            href = link.get("href")
            href = str(href)
            if href[0] == '/':
                join_url = urljoin(url, href)
                all_urls.add(join_url)
                print(join_url)

with open("allLinks.json", "w") as f:
    all_urls = list(all_urls)
    json.dump(all_urls, f, indent=4)