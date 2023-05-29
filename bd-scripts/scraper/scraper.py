from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import sys
import os
import requests
import shutil
from xlsxwriter import Workbook
from selenium.webdriver.common.by import By

class Scraper:
    def __init__(self, username, password, target_username):
        self.username = username
        self.password = password
        self.target_username = target_username
        self.base_path = os.path.join('data', self.target_username) 
        self.imagesData_path = self.base_path 
        self.driver = webdriver.Chrome('chromedriver_win32/chromedriver')
        self.main_url = 'https://www.instagram.com'
        
        try:
            self.driver.get(self.main_url)
            WebDriverWait(self.driver, 10).until(EC.title_is('Instagram'))
        except TimeoutError:
            print('Interneto problemos.')
            sys.exit()
        
        self.login()
        self.close_dialog_box()
        self.open_target_profile()

        if not os.path.exists('data'):
            os.mkdir('data')
        if not os.path.exists(self.base_path):
            os.mkdir(self.base_path)
        self.download_posts()

        self.driver.close()


    def login(self):

        try:
            wait = WebDriverWait(self.driver, 10)
            button = wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Allow all cookies']")))
            button.click()
        except Exception:
            print('Nerastas "Allow all cookies" mygtukas.')
            sys.exit()
        
        try: 
            wait = WebDriverWait(self.driver, 10)
            username_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@name = 'username']")))
        except Exception:
            print('Nerastas vartotojo prisijungimo laukas.')
            sys.exit()    

        try: 
            wait = WebDriverWait(self.driver, 10)
            password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@name = 'password']")))
        except Exception:
            print('Nerastas slaptazodzio prisijungimo laukas.')
            sys.exit() 
        
        try:
            username_input.send_keys(self.username)
            password_input.send_keys(self.password)
        except Exception:
            print('Interneto problemos.')
            sys.exit()

        print('Vykdomas prisijungimas')
        password_input.submit() 
        
        try:
            WebDriverWait(self.driver, 10).until(EC.title_is('Instagram'))
        except Exception:
            print('Neteisingi duomenys.')
            sys.exit()

        print('Prisijungimas pavyko.')
        

    def close_dialog_box(self):
        try:
            wait = WebDriverWait(self.driver, 10)
            button = wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Not Now']")))
            button.click()
        except Exception:
            pass 


    def open_target_profile(self):  
        target_profile_url  = self.main_url + '/' + self.target_username
        print('Keliaujama i {0} profili.'.format(self.target_username))
        
        try:
            self.driver.get(target_profile_url) 
        except TimeoutError:
            print('Profilis nerastas.')
            sys.exit()  
        

    def load_fetch_posts(self):
        image_set = set()

        try:
            wait = WebDriverWait(self.driver, 10)
            no_of_posts_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'span._ac2a')))
            self.no_of_posts = int(no_of_posts_element.text.replace(',', ''))
            print('{0} turi {1} nuotrauku.'.format(self.target_username, self.no_of_posts))   
        except Exception:
            print('Nerandamas nuotrauku skaicius.')
            sys.exit()

        last_height = self.driver.execute_script("return document.body.scrollHeight")

        while True:
            soup = BeautifulSoup(self.driver.page_source, 'lxml')
            all_images = soup.find_all('img', attrs = {'class': 'x5yr21d xu96u03 x10l6tqk x13vifvy x87ps6o xh8yej3'})

            for img in all_images:
                src = img.get('src')
                if src not in image_set:
                    image_set.add(src)

            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            sleep(2)

            new_height = self.driver.execute_script("return document.body.scrollHeight")

            if new_height == last_height:
                break

            last_height = new_height

        if len(image_set) != self.no_of_posts:
            print("Yra neatrastu nuotrauku. Rasta:", len(image_set), "Reikejo:", self.no_of_posts)

        return list(image_set)

    def download_posts(self):
        image_list = self.load_fetch_posts()
        no_of_images = len(image_list)
        for index, img_url in enumerate(image_list, start = 1):
            filename = 'image_' + str(index) + '.jpg'
            image_path = os.path.join(self.imagesData_path, filename)
            link = img_url
            response = requests.get(link, stream = True)
            print('Atsisiunciama {0} nuotrauka is {1}'.format(index, no_of_images))
            try:
                with open(image_path, 'wb') as file:
                    shutil.copyfileobj(response.raw, file)
            except Exception as e:
                print('Nepavyko atsisiust nuotraukos {0}.'.format(index))
        print('Atsisiusta pilnai.')