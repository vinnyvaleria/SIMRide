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
**WALLET: Cash out history [Shafiq doing now]** | BACKEND: Connected to Firebase 
**Design the app (UI/UX) [Vinny doing now]** | BACKEND: Registration authentication to Firebase 
**API: Google Maps API [Seng Yang doing now]** | BACKEND: Synced database to Firebase 
MAPS: Automatic route planning (fastest) | USERS: Logging into SIMRide 
WALLET: Top-up E-Wallet | USERS: Logging out of SIMRide 
WALLET: Remove total from E-Wallet after ride | BACKEND: Send data to Firebase 
-- | BACKEND: Made multiple tabs to act as pages 
BOOKING: Weekly pickup scheduler (not important) | BACKEND: Retrieve data from Firebase 
BOOKING: Mark ride as done as passenger | USERS: Edit Profile 
BOOKING: Mark drive as done as driver | USERS: View Profile 
BOOKING: Passengers set meeting area by plotting position on map | CHAT: Live chat, store chat, select user to chat with 
DRIVER: When starting the drive, get all passengers pick-up point/destination | USERS: View other profiles 
DRIVER: Get directions to and from school | USERS: Update password
DRIVER: Create hidden driver page to view map | CHAT: Stored chat history 
-- | CHAT: Retrieving chats
USERS: Rate the driver and rider (not important) | BOOKING: Create a Booking
ADMIN: Audit/log (not important) | BOOKING: Display list of available Booking
API: Stripe API | USERS: Apply to be driver: upload license image
BACKEND: Solve Express.js issues | USERS: Apply to be driver: add driver details
BACKEND: Deploy to firebase | BOOKING: Join booking
-- | BOOKING: View My Bookings
-- | BOOKING: Cancel confirmed ride
-- | WALLET: E-Wallet page
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
-- | BOOKING: Riders enter pick up point and choose payment method
-- | BOOKING: Choose travelling to school or from school
-- | BOOKING: Drivers able to reject riders if meeting spot not around the area
-- | DASHBOARD: If removed from booking, will be notified on dashboard
-- | BOOKING: Check for driver creating another booking for same time and day
-- | BOOKING: Check for passenger joining another booking for same time and day
-- | WALLET: Check for wallet balance when booking ride
-- | WALLET: Balance low reminder
-- | USERS: Transaction/booking history
-- | WALLET: Cash out for drivers 
