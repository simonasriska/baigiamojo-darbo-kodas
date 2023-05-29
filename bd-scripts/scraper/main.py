import sys
from scraper import Scraper 
from checker import Checker

if __name__ == '__main__':
    username = sys.argv[1]
    password = sys.argv[2]
    target_username = sys.argv[3]
    check = sys.argv[4]
    if (check == "true"):
        checker = Checker(username, password, target_username)
    else:
        scraper = Scraper(username, password, target_username)