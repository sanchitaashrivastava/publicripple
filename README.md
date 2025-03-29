# publicripple

## Steps to Run the Project

1. **Update Your Branch**  
   - Navigate to your branch in the `publicripple` repository.  
   - Ensure it is up to date with the `main` branch by running:  
     ```bash
     git pull origin main
     ```

2. **Set Up Environment Variables**  
   - Create a `.env.local` file in the root folder.  
   - Add the `NEXT_PUBLIC_NEWS_API_KEY` to the file. You can obtain the key by signing up at [NewsAPI](https://newsapi.org/).

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