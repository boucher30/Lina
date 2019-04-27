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
        case "teachers":
            sheet = app.$cms.teachers.slice();
            break;
        case "classes":
            sheet = app.$cms.classes.slice();
            break;
        case "quiz":
            sheet = app.$cms.quiz.slice();
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
        if(name){ //if we're given a specific name to find
        name = String(name).toLowerCase();
            let noBirthday = true;
            for(let j = 1; j < sheet.length; j++){
                let nameInSheet = String(sheet[j][NAME_INDEX]).toLowerCase();
                if(name === nameInSheet){
                    noBirthday = false;
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
            }
            if(noBirthday)
            {
                this.$speech.addText(this.t('birthday.DNE', {name}));
            }
        }
        else{//finding a list of names in desired time frame
            let timeframe = this.$inputs.timeframe.value;
            let currentDate = new Date();
            let week = true;
            if(timeframe.includes('W')){
                week = true;
                this.$speech.addText("This week is ");
            }
            else{
                this.$speech.addText("This month is ")
            }
            let names = [];
            for(let j = 1; j < sheet.length; j++){
                let birthday = sheet[j][DATE_INDEX];
                let name = sheet[j][NAME_INDEX];
                let birthdayMonth = birthday.substring(0,2);
                let birthdayDay = birthday.substring(3,5);
                console.log("day " + birthdayDay + "\n");
                if(week){ //looking for birthdays in the current week
                    let today = String(currentDate.getDate()).padStart(2,'0');
                    console.log("today " + today + "\n");
                    console.log("plus 7 " + (Number(today) + 7));
                    if(timeframe.includes(birthdayMonth) && (birthdayDay < (Number(today) + 7) && (birthdayDay >= Number(today)))){
                        names.push(name);
                    }
                }
                else{ //looking for birthdays in the current month
                    if(timeframe.includes(birthdayMonth)){
                        names.push(name);
                    }
                }
            }
            for(let k = 0; k < names.length; k++){
                this.$speech.addText(names[k]);
                this.$speech.addText("'s");
            }
        }
        this.$speech.addText(" birthday");
        this.ask(this.$speech);
    },

    QuestionsIntent() {
        var sheet = getSheet("questions");
        let question = String(this.$inputs.SQ.value).toLowerCase();
        

        for (let x =0; x < sheet.length; x++){
            let questionInSheet = String(sheet[x][0]).toLowerCase();
            if (questionInSheet.includes(question)){
                this.ask(sheet[x][1])
            }
        }
    },

    AnnouncementsIntent(){
        let sheet = getSheet("announcements");
        let empty = true;
        let currentDate = new Date();
          
            
        let month = currentDate.getMonth() + 1;
        let today = String(currentDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes so heres a workaround
    
        this.$speech.addText("The announcements for today are as follows: ");

        for(let x = 1; x < sheet.length; x++){
            let announcementDate = sheet[x][0];
            let monthInSheet = announcementDate.substring(0,2);
            let dayInSheet = announcementDate.substring(3,5);

            if(dayInSheet.includes(today) && monthInSheet.includes(month)){
                let numOfAnnouncements = Number(sheet[x][NUM_OF_ANNOUNCEMENTS_INDEX]) + 2;
                for(let y = 2; y < numOfAnnouncements; y++){
                    this.$speech.addText(sheet[x][y]);
                }
                empty = false;
                break;
            }
        }
        if(empty){
            this.$speech.addText("There are none today.")
        }
        this.ask(this.$speech);
    },


    MultiplyIntent(){
        var numone = parseInt(this.$inputs.numone.value);
        var numtwo = parseInt(this.$inputs.numtwo.value);
        let mulitplynum = numone * numtwo
        this.ask("You should visit Tania's class to learn that. Just kidding it is " + mulitplynum);
    },

    /*

        We can always grab the first 3 rows because the data sheet is sorted
        You can sort in Sheets by selecting the two rows Data > Sort Range > Check data has header > Z->A
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

    ClassIntent(){
        var sheet = getSheet("classes");
        let course = this.$inputs.class.value;
        if(course){
            course = String(this.$inputs.class.value).toLowerCase();
            for(let x = 1; x < sheet.length; x++){
                let courseInSheet = String(sheet[x][0]).toLowerCase();
                let courseDetail = sheet[x][1];
                if(courseInSheet.includes(course)){
                    this.$speech.addText(courseDetail)
                }
            }
        }else{
            this.$speech.addText("The courses taught at the SJIC are as follows: ");
            for(let x = 1; x < sheet.length; x++){
                let courseInSheet = sheet[x][0];
                this.$speech.addText(courseInSheet);
                if(x == sheet.length-2){
                    this.$speech.addText(" and ");
                }
            }
        }
        this.ask(this.$speech);
    },

    TeacherIntent(){
        var sheet = getSheet("teachers");
        let name = this.$inputs.name.value;
        if(name){
            name = String(this.$inputs.name.value).toLowerCase();
            for(let x = 1; x < sheet.length; x++){
                let nameInSheet = String(sheet[x][0]).toLowerCase();
                let work = sheet[x][1];
                if(name == nameInSheet){
                    this.$speech.addText(name + " " + work);
                }
            }
        }else{
            this.$speech.addText("The teachers at the SJIC include: ");
            for(let x = 1; x < sheet.length; x++){
                this.$speech.addText(sheet[x][0]);
                if(x == sheet.length-2){
                    this.$speech.addText(" and ");
                }
            }
        }   
        this.ask(this.$speech);
    },

    QuizOfTheDayIntent(){
        var sheet = getSheet("quiz");
        let randomRow = Math.floor(Math.random() * (sheet.length -1 )) + 1;
        let answer = sheet[randomRow][1];

        this.ask(sheet[randomRow][0]);
        let input = this.$inputs.answer.value;
        if(input == answer){
            this.ask("That's the correct answer!");
        }
        else{
            this.ask("That is not correct.");
        }
    },

    CreditsIntent(){
        this.ask("Thanks to RJ and Vlad for programing this using Jovo and Google Sheets. Also thanks to Anita for maintaining the database for this project and Dov for comming up with the idea");
    },

});

module.exports.app = app;
