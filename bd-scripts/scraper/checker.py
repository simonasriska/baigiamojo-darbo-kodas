from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys
from selenium.webdriver.common.by import By

class Checker:
    def __init__(self, username, password, target_username):
        self.username = username
        self.password = password
        self.target_username = target_username
        self.driver = webdriver.Chrome('chromedriver_win32/chromedriver')
        self.main_url = 'https://www.instagram.com'
        
        try:
            self.driver.get(self.main_url)
            WebDriverWait(self.driver, 10).until(EC.title_is('Instagram'))
        except TimeoutError:
            print('Interneto problemos.')
            sys.exit(1)
        
        self.login()
        self.close_dialog_box()
        self.open_target_profile()

        self.driver.close()
        sys.exit(0)


    def login(self):

        try:
            wait = WebDriverWait(self.driver, 10)
            button = wait.until(EC.presence_of_element_located((By.XPATH, "//button[normalize-space()='Allow all cookies']")))
            button.click()
        except Exception:
            print('Nerastas "Allow all cookies" mygtukas.')
            sys.exit(1)
        
        try: 
            wait = WebDriverWait(self.driver, 10)
            username_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@name = 'username']")))
        except Exception:
            print('Nerastas vartotojo prisijungimo laukas.')
            sys.exit(1)    

        try: 
            wait = WebDriverWait(self.driver, 10)
            password_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@name = 'password']")))
        except Exception:
            print('Nerastas slaptazodzio prisijungimo laukas.')
            sys.exit(1)
        
        try:
            username_input.send_keys(self.username)
            password_input.send_keys(self.password)
        except Exception:
            print('Interneto problemos.')
            sys.exit(1)

        print('Vykdomas prisijungimas')
        password_input.submit() 
        
        try:
            WebDriverWait(self.driver, 10).until(EC.title_is('Instagram'))
        except Exception:
            print('Neteisingi duomenys.')
            sys.exit(1)

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
        print('Keliaujama i {0} profili'.format(self.target_username))
        
        try:
            self.driver.get(target_profile_url)
            wait = WebDriverWait(self.driver, 12)
            no_of_posts_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'span._ac2a')))
            self.no_of_posts = int(no_of_posts_element.text.replace(',', ''))
            sys.exit(0)  
        except TimeoutError:
            print('Profilis nerastas.')
            sys.exit(1)