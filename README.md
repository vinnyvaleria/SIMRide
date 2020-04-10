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
**Cancel confirmed ride [Shafiq doing now]** | Connected to Firebase 
**Design the app (UI/UX) [Vinny doing now]** | Registration authentication to Firebase 
BOOKINGS: Filter - by area/time | Synced database to Firebase 
WALLET: E-Wallet page | Logging into SIMRide 
WALLET: Top-up E-Wallet | Logging out of SIMRide 
WALLET: Remove total from E-Wallet after ride | Send data to Firebase 
WALLET: Cash out for drivers | Made multiple tabs to act as pages 
WALLET: Balance low reminder | Retrieve data from Firebase 
USERS: Report user | Edit Profile - Account management 
USERS: Weekly pickup scheduler (not important) | View Profile - Account management 
USERS: Rate the driver and rider (not important) | Live chat, store chat, select user to chat with 
USERS: Transaction/booking history | View other profiles 
ADMIN: Ban user (blacklist user) | Update password - Account management
ADMIN: Audit/log (not important) | Stored chat history 
ADMIN: review driver application | Retrieving chats
Connect APIs | Create a Booking
eNETS Open API | Display list of available rides
MapQuest Directions API | Apply to be driver: upload license image
MapQuest Traffic API | Apply to be driver: add driver details
MAPS: Automatic route planning (fastest) | Join booking
-- | View My Bookings
