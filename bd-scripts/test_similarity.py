from similarity import cosine_similarity_score
import unittest
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class TestSimilarityMethods(unittest.TestCase):
    def test_cosine_similarity_score(self):
        user1 = {"object1": 5, "object2": 3, "object3": 2, "object4": 1}
        user2 = {"object1": 10, "object2": 6, "object3": 4, "object4": 2}

        common_keys = set(user1.keys()) | set(user2.keys())
        vector1 = np.array([user1.get(key, 0) for key in common_keys]).reshape(1, -1)
        vector2 = np.array([user2.get(key, 0) for key in common_keys]).reshape(1, -1)

        expected_similarity = 1

        actual_similarity = cosine_similarity_score(user1, user2)

        self.assertEqual(expected_similarity, actual_similarity)

if __name__ == '__main__':
    unittest.main()