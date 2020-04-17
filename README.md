# SIMRide by FYP20-S1-10



**Initial setup**

1. Install Node.js accordingly

2. Install react globally :
    ```
        npm install -g react-native-cli
    ```

3. To install Expo CLI :
    ```
        npm install -g expo-cli
    ```

4. Go to a designated location in your pc (make sure you have access to the repository):
    ```
        sudo git clone https://github.com/xshafqx/Carpool-World.git
        *input your laptop password
    ```

5. Go to your terminal :
    ```
        cd Carpool-World/Carpool-World/Carpool-World
        npm start
        w
    ```



**On your preferred editor, open the Carpool folder**

To create and push your new branch to github :
```
git pull origin
git checkout -b [name_of_your_new_branch]
git push origin [name_of_your_new_branch]
```


To see all the branches :
```
git branch -a
```


To commit changes to remote branch :
```
git status
git add .
git checkout
git commit -m "[your_message]"
git push origin [name_of_your_branch]
```


To switch branch :
```
git checkout [branch_name]
```


**Work progress**

In-Progress | Done
----------- | -----------
**WALLET: Top-up E-Wallet [Shafiq doing now]** | BACKEND: Connected to Firebase 
**Design the app (UI/UX) [Vinny doing now]** | BACKEND: Registration authentication to Firebase 
**API: Google Maps API [Seng Yang doing now]** | BACKEND: Synced database to Firebase 
MAPS: Automatic route planning (fastest) | USERS: Logging into SIMRide 
-- | USERS: Logging out of SIMRide 
WALLET: Remove total from E-Wallet after ride | BACKEND: Send data to Firebase 
WALLET: Cash out for drivers | BACKEND: Made multiple tabs to act as pages 
WALLET: Balance low reminder | BACKEND: Retrieve data from Firebase 
WALLET: Check for wallet balance when booking ride | USERS: Edit Profile 
BOOKING: Weekly pickup scheduler (not important) | USERS: View Profile 
BOOKING: Request area when users join | CHAT: Live chat, store chat, select user to chat with 
BOOKING: Passengers set meeting area by plotting position on map | USERS: View other profiles 
DRIVER: When starting the drive, get all passengers meeting area | USERS: Update password
DRIVER: Plot the meeting area on the map | CHAT: Stored chat history 
DRIVER: Get directions to area and lastly to school | CHAT: Retrieving chats
DRIVER: Create hidden driver page to view map | BOOKING: Create a Booking
BOOKING: Mark drive as done as driver | BOOKING: Display list of available Booking
BOOKING: Mark ride as done as passenger | USERS: Apply to be driver: upload license image
API: Stripe API | USERS: Apply to be driver: add driver details
USERS: Rate the driver and rider (not important) | BOOKING: Join booking
USERS: Transaction/booking history | BOOKING: View My Bookings
-- | BOOKING: Cancel confirmed ride
ADMIN: Audit/log (not important) | WALLET: E-Wallet page
-- | BOOKING: View created rides
-- | PERMISSIONS: Split users into roles, and define what each role can see
-- | USERS: Forgot password reset email
-- | ADMIN: review driver application
-- | BOOKING: Cancel created booking
-- | ADMIN: Ban user (blacklist user)
-- | USERS: Report user
-- | USERS: Dashboard (Maybe will add wallet balance)
-- | BOOKING: Choose to pay by cash or wallet
-- | WALLET: Set up wallet for all users
-- | BACKEND: Find a datetime picker to allow datetime comparisons in database
-- | BOOKING: Filter - by area
-- | BOOKING: Remove area from create a booking
