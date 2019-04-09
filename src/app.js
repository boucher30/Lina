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

const NAME_INDEX = 0;
const DATE_INDEX = 1;
const app = new App();
var x = 0;
var y = 0;
var announcementstext = ""; 

app.use(
    new Alexa(),
    new GoogleSheetsCMS(),
    new JovoDebugger(),
    new FileDb()
);

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
// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

function getToDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    
    return today;
}
app.setHandler({
    
    LAUNCH() {
        this.$speech.addT('response.greeting')
        this.ask(this.$speech);
    },

    BirthdayIntent() {
        var sheet = getSheet("birthdays");
        let name = this.$inputs.name.value;
        for(let j = 1; j < sheet.length; j++){
            let nameInSheet = sheet[j][NAME_INDEX];
            if(name === nameInSheet){
                let birthday = sheet[j][DATE_INDEX];

                let todayDate = new Date();
                
                let today = String(todayDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes heres a workaround
                let month = todayDate.getMonth() + 1;
                console.log(todayDate);
                console.log(today);
                console.log(month);

                let dayInSheet = birthday.substring(3,5);
                let monthInSheet = birthday.substring(0,2);
                console.log(dayInSheet);
                console.log(monthInSheet);

                if(dayInSheet.includes(today) && monthInSheet.includes(month)){
                    this.$speech.addT("response.playBirthday", {name}).addAudio("../audio/Happy_Birthday_to_You_Boi.mp3");
                }
                else{
                    this.$speech.addT('response.birthday', {name, birthday})
                }
            }
        }
        this.tell(this.$speech);
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
        //let sqValue = this.$inputs.SQ.value
        //let speech = this.speechBuilder();

        var sheet = getSheet("announcements");

        var datetoday = getToDate();
        console.log(this.t(sheet[1][2]));
        for (x = 0; x < sheet.length; x++){

            if (this.t(sheet[x][0]) == datetoday){
                //this.ask(this.t(sheet[x][1]))
                var numData = this.t(sheet[x][1]);
                var rnum = parseInt(numData);
                announcementstext = announcementstext + "The Announcments are";
                for (y = 2; y < rnum+2; y++){
                    console.log(x);
                    console.log(y);
                    //console.log(x);
                    //announcementstext = announcementstext + this.t(sheet[x][y]);
                    console.log(this.t(sheet[x][y]));//1, 2/3
                    announcementstext= announcementstext.concat(this.t(sheet[x][y]))
                    //print(y);
                    //this.$speech.addText(this.t(sheet[x][y]))
                                //.addBreak('300ms');
                    //speech.addText(this.t(sheet[x][y]));
                    
                }
                console.log(announcementstext);
                //this.tell(announcementstext);
                //this.tell(this.$speech);
                //this.tell(speech);
            }
        }
        //this.tell(datetoday)
        //this.tell(this.t(sheet[0][1]))
        //for (let x = 0; x < sheet.length; x++){

        //    if (this.t(sheet[x][0]) == sqValue){
        //        this.ask(this.t(sheet[x][1]))
        //    }
        //}
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


    ChallengeIntent(){
        var sheet = getSheet("challenge");
        let speech = this.speechBuilder();
        speech.addText('In third place is ' + this.t(sheet4[3][1]) + ' with ' + this.t(sheet4[3][2]) + ' points')
                        .addAudio('../audio/ClapClap.mp3')
                        .addBreak('300ms');
        speech.addText('In second place is ' + this.t(sheet4[2][1]) + ' with ' + this.t(sheet4[2][2]) + ' points')
                        .addAudio('../audio/ClapClap.mp3')
                        .addBreak('300ms');
        speech.addText('In First place is ' + this.t(sheet4[1][1]) + ' with ' + this.t(sheet4[1][2]) + ' points')
                        .addAudio('../audio/ClapClap.mp3')
                        .addBreak('300ms');
        this.ask(speech);
    },


    CreditsIntent(){
        this.ask("Thanks to RJ and Vlad for programing this using Jovo and Google Sheets. Also thanks to Anita for maintaining the database for this project and Dov for comming up with the idea");
    }
});

module.exports.app = app;
