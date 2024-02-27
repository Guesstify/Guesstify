import os
import json
import random

def form_track_list(response):
    rank = 1

    returnDict = {}
    data_list = []
    top_seeds = []
    for item in response["items"]:
        item_data = {}
        item_data["track_name"] = item["name"]
        item_data["rank"] = rank
        rank += 1
        item_data["snippet"] = item["preview_url"]
        item_data["album_cover"] = item["album"]["images"][0]["url"]
        item_data["artist"] = item["artists"][0]["name"]
        data_list.append(item_data)
        if len(top_seeds) < 5:
            top_seeds.append(item["id"])
    random.shuffle(data_list)

    returnDict["data_list"] = data_list
    returnDict["top_seeds"] = top_seeds

    return returnDict

# {
#     "user":"name"
#     "data":[
#         {
#             "trackName" : "name of track",
#             "Rank" : "1...N",
#             "Snippet" : "Link for 30 second playback",
#             "Album Cover" : "Probably a link",
#             "Artist" : "artist link",
#             "spotify_id": "id",
#         }
#     ]
# }


def form_artist_list(response):

    returnDict = {}
    data_list = []
    top_seeds = []
    genre_dict = {}

    for item in response["items"]:
        item_data = {}
        item_data["artist_name"] = item["name"]
        item_data["artist_picture"] = item["images"][0]["url"]
        data_list.append(item_data)
        if len(top_seeds) < 5:
            top_seeds.append(item["id"])

        artist_genres = item["genres"]

        for genre in artist_genres:
            if genre not in genre_dict:
                genre_dict[genre] = []
                genre_dict[genre].append(item["id"])
            else:
                if len(genre_dict[genre] < 5):
                    genre_dict[genre].append(item["id"])

    returnDict["data_list"] = data_list
    returnDict["top_seeds"] = top_seeds
    returnDict["genre_dict"] = genre_dict

    return returnDict


# { outdated
#     "data": [
#         {
#             "artist_name": "name of artist",
#             "artist_picture": "picture link",
#             "spotify_id": "spotify id"

#         }
#     ]
# }


def recommend_songs(reponse):

    returnDict = {}
    data_list = []

    for item in response["tracks"]:
        item_data = {}
        item_data["album_image"] = item["album"]["images"]["url"]
        item_data["album_name"] = item["album"]["images"]["url"]
        item_data["artist_name"] = item["artists"][0]["name"]
        item_data["song_name"] = item["name"]
        item_data["song_snippet"] = item["preview_url"]
        data_list.append(item_data)

    returnDict["data_list"] = data_list

    return returnDict






# for each artist returned, create a hash map with artists' genre as key and artist id as value such that we can use it for recommender