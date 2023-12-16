import os
import json


def form_list(response):
    rank = 1

    data_list = []
    for item in response["items"]:
        item_data = {}
        item_data["track_name"] = item["name"]
        item_data["rank"] = rank
        rank += 1
        item_data["snippet"] = item["preview_url"]
        item_data["album_cover"] = item["album"]["images"][0]["url"]
        item_data["artist"] = item["artists"][0]["name"]
        data_list.append(item_data)
    return data_list


# {
#     "user":"name"
#     "data":[
#         {
#             "trackName" : "name of track",
#             "Rank" : "1...N",
#             "Snippet" : "Link for 30 second playback",
#             "Album Cover" : "Probably a link",
#             "Artist" : "artist link",
#         }
#     ]
# }
