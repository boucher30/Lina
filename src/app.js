'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
//lamda Function:
//arn:aws:lambda:us-east-1:687806271339:function:LinaLamdaFunction
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { GoogleSheetsCMS } = require('jovo-cms-googlesheets');
const https = require('https');

//Declare Sheet global constants here
const NAME_INDEX = 0;
const DATE_INDEX = 1;
const POINTS_INDEX = 1;
const NUM_OF_ANNOUNCEMENTS_INDEX = 1;

const app = new App();

app.use(
    new Alexa(),
    new GoogleSheetsCMS(),
    new JovoDebugger(),
    new FileDb()
);

//Point app to the desired sheet to get required data
function getSheet(name){
    var sheet;
    switch(name){
        case "birthdays":
            sheet = app.$cms.birthdays.slice();
            break;
        case "questions":
            sheet = app.$cms.questions.slice(); 
            break;
        case "announcements":
            sheet = app.$cms.announcements.slice();
            break;
        case "challenge":
            sheet = app.$cms.challenge.slice();
            break;
    }
    return sheet;
}

//Used for the challenge intent for loop
function getRank(place){
    let value;
    switch(place){
        case 1:
            value = "first";
            break;
        case 2:
            value = "second";
            break;
        case 3:
            value = "third";
            break;
    }
    return value;
}

//Print out the date in a user friendly format
function getToDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    
    return today;
}

//Handler for all intents
app.setHandler({
    
    //Open starting Handler
    LAUNCH() {
        this.$speech.addT('greeting.help')
        this.ask(this.$speech);
    },

    /*
        Takes in a name from user, compares it to the birthdays sheet. Will
        report their birthday date unless it is the current date
        and will instead play a celebratory song.
    */
    BirthdayIntent() {
        var sheet = getSheet("birthdays");
        let name = this.$inputs.name.value;
        for(let j = 1; j < sheet.length; j++){
            let nameInSheet = sheet[j][NAME_INDEX];
            if(name === nameInSheet){
                let birthday = sheet[j][DATE_INDEX];
                let currentDate = new Date();
                
                let today = String(currentDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes so heres a workaround
                let month = currentDate.getMonth() + 1;

                let monthInSheet = birthday.substring(0,2);
                let dayInSheet = birthday.substring(3,5);
                
                
                if(dayInSheet.includes(today) && monthInSheet.includes(month)){
                    //"Today is " + name + "'s birthday, let's celebrate!"
                    this.$speech.addText(this.t('birthday.play', {name})).addAudio("https://s3.amazonaws.com/lina1234/happy-birthday.mp3");
                }
                else{
                    this.$speech.addText(this.t('birthday.date', {name, birthday}));
                }
            }
            else{
                this.$speech.addText(this.t('birthday.DNE', {name}));
                break; //gets us out of the loop
            }
        }
        this.ask(this.$speech);
    },

    QnAIntent() {
        let sqValue = this.$inputs.SQ.value
         var sheet = getSheet("questions");

        //this.tell(this.t(sheet[0][1]))
        for (let x = 0; x < sheet.length; x++){

            if (this.t(sheet[x][0]) == sqValue){
                this.ask(this.t(sheet[x][1]))
            }
        }
    },

    announcementsIntent(){
        let sheet = getSheet("announcements");
        let empty = true;
        let currentDate = new Date();
          
            
        let month = currentDate.getMonth() + 1;
        let today = String(currentDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes so heres a workaround

        console.log('cMonth: ' + month)
        console.log('cDay: ' + today + '\n')
        
        this.tell(JSON.stringify(sheet));
        //this.$speech.addText("The announcements for today are as follows: ");
        //this.$speech.addT(this.t(sheet[1][2]));
        // for(let x = 1; x < sheet.length; x++){
        //     let announcementDate = sheet[x][0];
        //     let monthInSheet = announcementDate.substring(0,2);
        //     let dayInSheet = announcementDate.substring(3,5);
        //     console.log('sMonth: ' + monthInSheet)
        //     console.log('sDay: ' + dayInSheet+ '\n')
            


        //     if(dayInSheet.includes(today) && monthInSheet.includes(month)){
        //         let numOfAnnouncements = sheet[x][NUM_OF_ANNOUNCEMENTS_INDEX];
        //         for(let y = NUM_OF_ANNOUNCEMENTS_INDEX + 1; y <= numOfAnnouncements; y++){
        //             console.log('y ' + y)
                    
        //         }
        //         empty = false;
        //         break;
        //     }
        // }
        // if(empty){
        //     this.$speech.addText("There are none today.")
        // }
        // this.ask(this.$speech);
    },

    
    //SignupIntent(){
    //    let cliname = this.$inputs.username.value
    //    let classes = this.$inputs.classes.value
    //    this.tell('hello ' + cliname + ', your signing up for ' + classes + ', please see Anita to complete you signup')//end
    //}
    SignupInitIntent(){
        let cliname = this.$inputs.username.value
        //also https.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', (resp) => {
        //let data = '';
        //https.get("https://bluemansrun.tk/AlexaParser/parsesignup.php?name="+cliname);
        this.ask('hello '+ cliname + ' what would you like to sign up for?');//kill here
    },


    SignupBaseIntent(){
        let classes = this.$inputs.classes.value
        //write
        //https.get("https://bluemansrun.tk/AlexaParser/parsesignup.php?classes="+classes);
        this.ask("your signing up for " + classes + ', please see Anita to complete you signup');//kill here
    },


    MultiplyIntent(){
        var numone = parseInt(this.$inputs.numone.value);
        var numtwo = parseInt(this.$inputs.numtwo.value);
        let mulitplynum = numone * numtwo
        this.ask("You should visit Tania's class to learn that. Just kidding it is " + mulitplynum);
    },

    /*

        We can always grab the first 3 rows because the data sheet is sorted
        You can sort by selecting the two rows Data > Sort Range > Check data has header > Z->A
    */
    ChallengeIntent(){
        var sheet = getSheet("challenge");

        for(let j = 3; j >= 1; j--){
            let name = this.t(sheet[j][NAME_INDEX]);
            let rank = getRank(j);
            let points = this.t(sheet[j][POINTS_INDEX]);
            this.$speech.addText(this.t('challenge.rankings', {rank, name, points})).addAudio('https://s3.amazonaws.com/lina1234/clap.mp3').addBreak('500ms');
        }
        this.ask(this.$speech);
    },


    CreditsIntent(){
        this.ask("Thanks to RJ and Vlad for programing this using Jovo and Google Sheets. Also thanks to Anita for maintaining the database for this project and Dov for comming up with the idea");
    }
});

module.exports.app = app;
