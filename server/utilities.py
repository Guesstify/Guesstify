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
        item_data["id"] = item["id"]
        data_list.append(item_data)


        if len(top_seeds) < 5:
            top_seeds.append(item["id"])

        artist_genres = item["genres"]

        for genre in artist_genres:
            if genre not in genre_dict:
                genre_dict[genre] = []
                genre_dict[genre].append(item["id"])
            else:
                if len(genre_dict[genre]) < 5:
                    genre_dict[genre].append(item["id"])


    returnDict["data_list"] = data_list
    returnDict["top_seeds"] = top_seeds
    returnDict["genre_dict"] = genre_dict

    return returnDict

def form_track_list(response):

    returnDict = {}
    data_list = []

    for item in response["items"]:
        item_data = {}
        item_data["track_name"] = item["name"]
        item_data["track_picture"] = item["album"]["images"][0]["url"]
        item_data["id"] = item["id"]
        data_list.append(item_data)



    returnDict["data_list"] = data_list

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


def recommend_songs(response):

    returnDict = {}
    data_list = []

    for item in response["tracks"]:
        item_data = {}
        item_data["album_image"] = item["album"]["images"][0]["url"]
        item_data["album_name"] = item["album"]["name"]
        item_data["artist_name"] = item["artists"][0]["name"]
        item_data["song_name"] = item["name"]
        item_data["song_snippet"] = item["preview_url"]
        data_list.append(item_data)

    returnDict["data_list"] = data_list

    print(returnDict)

    return returnDict


def artist_fetch_info(response):
    returnDict = {}
    data_list = []

    for track in response["tracks"]:
        if len(data_list) > 4:
            break
        item_data = {}
        item_data["track_name"] = track["name"]
        item_data["album_name"] = track["album"]["name"]
        item_data["album_image"] = track["album"]["images"][0]["url"]
        item_data["popularity"] = track["popularity"]
        data_list.append(item_data)

    returnDict["data_list"] = data_list

    return returnDict

def form_playlist_list(response):
    returnDict = {}
    data_list = []

    if len(response["items"]) == 0:
        return None

    #if the playlist doesn't have at least 15 tracks, it doesn't work
    for playlist in response["items"]:

        if playlist["images"] == None or playlist["tracks"]["total"] < 15:
            continue

        item_data = {}
        item_data["playlist_name"] = playlist["name"]
        item_data["size"] = playlist["tracks"]["total"]

        item_data["playlist_image"] = playlist["images"][0]["url"]
        item_data["playlist_owner"] = playlist["owner"]["id"]
        item_data["playlist_id"] = playlist["id"]
        data_list.append(item_data)
        
    returnDict["data_list"] = data_list

    return returnDict

def get_playlist_items(response, offset):
    returnDict = {}
    data_list = []

    print(response)

    if len(response["items"]) == 0:
        return None

    # return response

    for index, track in enumerate(response["items"]):

        if track["track"] is None:  # Check if track is None
            continue

        print(index)
        item_data = {}
        item_data["track_name"] = track["track"]["name"]
        item_data["track_uri"] = track["track"]["uri"]
        item_data["popularity"] = track["track"]["popularity"]
        item_data["snippet"] = track["track"]["preview_url"]
        item_data["track_id"] = track["track"]["id"]
        item_data["priority"] = 0

        item_data["track_image"] = track["track"]["album"]["images"][0]["url"]
        item_data["track_artist"] = track["track"]["artists"][0]["name"]
        item_data["track_num"] = int(offset)+index
        data_list.append(item_data)

    returnDict["data_list"] = data_list

    return returnDict


def create_playlist(response):
    returnDict = {}
    print("hERE")
    print(response)

    returnDict["id"] = response["id"]
    returnDict["uri"] = response["uri"]
    returnDict["name"] = response["name"]

    return returnDict



# for each artist returned, create a hash map with artists' genre as key and artist id as value such that we can use it for recommender