import sys
import json
import base64
import numpy as np
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity

def load_data_from_base64(encoded_data):
    decoded_data = base64.b64decode(encoded_data).decode('utf-8')
    return json.loads(decoded_data)

def process_user_data(data):
    users_by_frequency = defaultdict(lambda: defaultdict(int))
    users_by_relative_size = defaultdict(lambda: defaultdict(float))
    for item in data:
        target = item['target']
        for obj in item['objects']:
            users_by_frequency[target][obj['objectName']] += 1
            users_by_relative_size[target][obj['objectName']] += obj['relativeSize']
    return users_by_frequency, users_by_relative_size

def common_objects_vector(user1, user2):
    common_keys = set(user1.keys()) | set(user2.keys())
    vector1 = [user1.get(key, 0) for key in common_keys]
    vector2 = [user2.get(key, 0) for key in common_keys]
    return np.array(vector1).reshape(1, -1), np.array(vector2).reshape(1, -1)

def cosine_similarity_score(user1, user2):
    vector1, vector2 = common_objects_vector(user1, user2)
    if (vector1.size > 0 and vector2.size > 0):
        similarity = cosine_similarity(vector1, vector2)[0][0]
        return similarity
    else:
        return 0

def get_similar_users_by_frequency(input_user_id, users_by_frequency, threshold=0.0):
    input_user_freq = users_by_frequency[input_user_id]
    similar_users = []
    for user_id, user_freq in users_by_frequency.items():
        if str(user_id) != input_user_id:
            similarity_by_frequency = cosine_similarity_score(input_user_freq, user_freq)
            if similarity_by_frequency >= threshold:
                similar_user = {
                    'id': user_id,
                    'objectsByFrequency': user_freq,
                    'similarityByFrequency': similarity_by_frequency
                }
                similar_users.append(similar_user)
    return similar_users

def get_similar_users_by_relative_size(input_user_id, users_by_relative_size, threshold=0.0):
    input_user_size = users_by_relative_size[input_user_id]
    similar_users = []
    for user_id, user_size in users_by_relative_size.items():
        if str(user_id) != input_user_id:
            similarity_by_relative_size = cosine_similarity_score(input_user_size, user_size)
            if similarity_by_relative_size >= threshold:
                similar_user = {
                    'id': user_id,
                    'objectsByRelativeSize': user_size,
                    'similarityByRelativeSize': similarity_by_relative_size
                }
                similar_users.append(similar_user)
    return similar_users

def combine_similar_users(similar_users_frequency, similar_users_relative_size):
    combined_similar_users = defaultdict(dict)
    for user in similar_users_frequency:
        combined_similar_users[user['id']].update(user)
    for user in similar_users_relative_size:
        combined_similar_users[user['id']].update(user)
    return combined_similar_users.values()

def main():
    input_user_id = str(sys.argv[1])

    data_base64 = sys.stdin.read()

    data = load_data_from_base64(data_base64)
    users_by_frequency, users_by_relative_size = process_user_data(data)
    similar_users_frequency = get_similar_users_by_frequency(input_user_id, users_by_frequency, threshold=0.0)
    similar_users_relative_size = get_similar_users_by_relative_size(input_user_id, users_by_relative_size,threshold=0.0)
    combined_similar_users = combine_similar_users(similar_users_frequency, similar_users_relative_size)
    print(json.dumps(list(combined_similar_users), indent=2))

if __name__ == '__main__':
    main()