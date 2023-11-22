from typing import Union
from starlette.responses import RedirectResponse
from fastapi import FastAPI
import secrets
import urllib.parse
from dotenv import load_dotenv
import os

app = FastAPI()
load_dotenv('../.env.local')
client_id = os.getenv('SPOTIFY_CLIENT_ID')

redirect_uri = 'http://localhost:8000/callback';


@app.get("/")
def read_root():
    return {"Hello": client_id}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/login")
async def login():
    state = secrets.token_urlsafe(16)
    scope = 'user-read-private user-read-email'
    redirect_uri = 'http://localhost:3000/'

    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": scope,
        "redirect_uri": redirect_uri,
        "state": state
    }

    query_string = urllib.parse.urlencode(query_params)
    auth_url = f'https://accounts.spotify.com/authorize?{query_string}'

    return RedirectResponse(url=auth_url)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)