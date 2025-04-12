# publicripple

## Steps to Run the Backend

1. Use a .env in server that has:
- DB_HOST
- DB_NAME
- DB_USER
- DB_PASSWORD
- DB_PORT
- PUBLIC_NEWS_API_KEY
2. Create a python virtual environment  
`For Windows
python -m venv venv
venv\Scripts\activate`  

`For macOS/Linux
python3 -m venv venv
source venv/bin/activate`
3. Run pip install -r server/requirements.txt to install dependencies
4. Start project by running python server/app.py


## Steps to Run the Front End

1. **Update Your Branch**  
   - Navigate to your branch in the `publicripple` repository.  
   - Ensure it is up to date with the `main` branch by running:  
     ```bash
     git pull origin main
     ```

2. **Set Up Environment Variables**  
   - Create a `.env.local` file in the root folder.  
   - Add the `NEXT_PUBLIC_NEWS_API_KEY` to the file. You can obtain the key by signing up at [NewsAPI](https://www.thenewsapi.com/documentation).

3. **Install Dependencies**  
   - Install the required dependencies by running:  
     ```bash
     npm install
     ```

4. **Run the Development Server**  
   - Start the app by executing:  
     ```bash
     npm run dev
     ```  
   - This will launch the development server and open the app in your default web browser.

5. **Branch Management**  
   - Ensure you are not on the `main` branch if you are making any changes.