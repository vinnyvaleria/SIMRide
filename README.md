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
**USER: Show transaction history [Shafiq doing now]** | BACKEND: Connected to Firebase 
**FRONTEND: Design the app (UI/UX) [Vinny doing now]** | BACKEND: Registration authentication to Firebase 
**DRIVER: Get directions to and from school [Seng Yang doing now]** | BACKEND: Synced database to Firebase 
-- | USERS: Logging into SIMRide 
-- | USERS: Logging out of SIMRide 
WALLET: Remove total from E-Wallet after ride | BACKEND: Send data to Firebase 
-- | BACKEND: Made multiple tabs to act as pages 
-- | BACKEND: Retrieve data from Firebase 
-- | USERS: Edit Profile 
-- | USERS: View Profile 
-- | CHAT: Live chat, store chat, select user to chat with 
BACKEND: Push notification when rides are nearing | USERS: View other profiles 
ADMIN: Audit/log (not important) | USERS: Update password
-- | CHAT: Stored chat history 
-- | CHAT: Retrieving chats
-- | BOOKING: Create a Booking
-- | BOOKING: Display list of available Booking
-- | USERS: Apply to be driver: upload license image
-- | USERS: Apply to be driver: add driver details
-- | BOOKING: Join booking
-- | BOOKING: View My Bookings
DRIVER: When starting the drive, get all passengers pick-up point/destination | BOOKING: Cancel confirmed ride
DRIVER: Create hidden driver page to view map | WALLET: E-Wallet page
BOOKING: Mark drive as done as driver | BOOKING: View created rides
BOOKING: Mark ride as done as passenger | PERMISSIONS: Split users into roles, and define what each role can see
USERS: Rate the driver and rider (not important) | USERS: Forgot password reset email
USERS: GPS tracking for moving cars (not important) | ADMIN: review driver application
-- | BOOKING: Cancel created booking
-- | ADMIN: Ban user (blacklist user)
-- | USERS: Report user
-- | USERS: Dashboard (Maybe will add wallet balance)
-- | BOOKING: Choose to pay by cash or wallet
-- | WALLET: Set up wallet for all users
-- | BACKEND: Find a datetime picker to allow datetime comparisons in database
-- | BOOKING: Filter - by area
-- | BOOKING: Remove area from create a booking
-- | BOOKING: Riders enter pick up point and choose payment method
-- | BOOKING: Choose travelling to school or from school
-- | BOOKING: Drivers able to reject riders if meeting spot not around the area
-- | DASHBOARD: If removed from booking, will be notified on dashboard
-- | BOOKING: Check for driver creating another booking for same time and day
-- | BOOKING: Check for passenger joining another booking for same time and day
-- | WALLET: Check for wallet balance when booking ride
-- | WALLET: Balance low reminder
-- | USERS: Transaction
-- | WALLET: Cash out for drivers 
-- | WALLET: Cash out history
-- | BOOKING: Passengers set meeting area by plotting position on map
-- | API: Google Maps API
-- | BOOKING: Allow last minute cancellation, but also allow users to report if driver/passenger did not show up, admin will be able investigate thru msgs
-- | DRIVER: Create recurring rides
-- | BACKEND: Deploy to firebase (carpool-world-5uck5.web.app)
-- | WALLET: Top-up E-Wallet (WORKS NOW, TEST PAYMENT WITH CARD: 4242 4242 4242 4242, ANY 3 DIGITS CVC, ANY FUTURE DATE FROM TODAY)
-- | BACKEND: Solve Express.js issues
-- | BACKEND: Refolder files
-- | API: Get Stripe API working
-- | USERS: Transaction Update
