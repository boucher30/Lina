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

function getMonthID(month){
    let value;
    switch(month){
        case 'JANUARY': 
            value = '01';
            break;
        case 'FEBRUARY': 
            value = '02';
            break;
        case 'MARCH': 
            value = '03';
            break;
        case 'APRIL': 
            value = '04';
            break;
        case 'MAY': 
            value = '05';
            break;
        case 'JUNE': 
            value = '06';
            break;
        case 'JULY': 
            value = '07';
            break;
        case 'AUGUST': 
            value = '08';
            break;
        case 'SEPTEMBER': 
            value = '09';
            break;
        case 'OCTOBER': 
            value = '10';
            break;
        case 'NOVEMBER': 
            value = '11';
            break;
        case 'DECEMBER': 
            value = '12';
            break;
    }
    return value;
}
//Epoch time converter to get the current week number
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000- 3 + (week1.getDay() + 6) % 7) / 7);
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
        //Sheet and all possible inputs
        var sheet = getSheet("birthdays");
        let inputName = this.$inputs.name.value;
        let month = this.$inputs.month.value;
        let timeframe = this.$inputs.timeframe.value;



        if(inputName){ //if we're given a specific name to find
            inputName = String(inputName).toLowerCase();
            let nameExists = false;
            for(let j = 1; j < sheet.length; j++){
                let nameInSheet = String(sheet[j][NAME_INDEX]).toLowerCase();
                if(nameInSheet.includes(inputName)){
                    nameExists = true; //the input name is found in the db

                    let birthday = sheet[j][DATE_INDEX]; //parse the birthday and split it up
                    let monthInSheet = birthday.substring(0,2);
                    let dayInSheet = birthday.substring(3,5);

                    let currentDate = new Date(); //parse the current date and split it up
                    let currentDay = String(currentDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes so heres a workaround
                    let currentMonth = currentDate.getMonth() + 1;

                    
                    if(dayInSheet.includes(currentDay) && monthInSheet.includes(currentMonth)){//if their birthday is today lets sing
                        this.$speech.addText(this.t('birthday.play', {inputName})).addAudio("https://s3.amazonaws.com/lina1234/happy-birthday.mp3");
                    }
                    else{ //otherwise report their birthday
                        this.$speech.addText(this.t('birthday.date', {inputName, birthday}));
                    }
                } 
            }
            if(!nameExists) //the input name is never found, consider adding it to the db
            {
                this.$speech.addText(this.t('birthday.DNE', {name}));
            }
        }
        else if(month){// grab all names that have a birthday in the specified month
            let upper = String(month).toUpperCase();
            let monthID = getMonthID(upper);
            for(let x = 1; x < sheet.length; x++){
                let date = sheet[x][DATE_INDEX];
                let monthInSheet = date.substring(0,2);
                if(monthInSheet.includes(monthID)){
                    this.$speech.addText(sheet[x][NAME_INDEX])
                }
            }
            this.ask(this.$speech);
        }
        else if(timeframe){//find a list of names in desired time frame
            let currentDate = new Date();
            let week = false;

            if(timeframe.includes('W') || timeframe.includes('w')){//AMAZON.DATE returns ISO date format '2019-W18'
                week = true;
            }

            let names = [];
            let numOfWeek;
            let numOfMonth;
            for(let j = 1; j < sheet.length; j++){
                let birthday = sheet[j][DATE_INDEX];
                let adjustedYear = String(birthday).substring(0,5) + "-" + String(currentDate.getFullYear()); //This way week numbers align for different years
                let birthWeek = new Date(adjustedYear).getWeek(); //Returns the ISO week number of date in db

                let name = sheet[j][NAME_INDEX];
                let birthMonth = birthday.substring(0,2);
                if(week){//Looking for birhdays is this/next week
                    if(timeframe.includes('this')){
                        numOfWeek = currentDate.getWeek();
                        console.log("Current " + numOfWeek);
                        console.log("Birth " + birthWeek);
                    }
                    else{
                        numOfWeek = currentDate.getWeek() + 1;
                    }

                    if(birthWeek == numOfWeek){
                        names.push(name);
                    }
                }
                else{ //looking for birthdays this/next month
                    if(timeframe.includes('this')){
                        numOfMonth = currentDate.getMonth();
                        console.log("Current " + numOfMonth);
                        console.log("Birth " + birthMonth);
                    }
                    else{
                        numOfMonth = currentDate.getMonth() + 1;
                    }

                    if(birthMonth == numOfMonth){
                        names.push(name);
                    }
                }
            }
            for(let k = 0; k < names.length; k++){
                this.$speech.addText(names[k]);
                this.$speech.addText("'s");
            }
            this.$speech.addText("birthday is " + String(timeframe));
            this.ask(this.$speech);    
        }
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
        let input = this.$inputs.answer.value;
        this.$speech.addText(sheet[randomRow][0]);
        if(answer == input){
            this.followUpState('AnswerState')
            .ask(this.$speech);
        }
        else{
            this.followUpState('WrongState')
            .ask(this.$speech);
        }
    },

    CorrectState:{
        CorrectIntent(){
            this.ask("That's the correct answer!");
        },
    },

    WrongState:{
        WrongIntent(){
            this.ask("That is not correct.");
        },
    },

    Unhandled(){
        this.ask(this.t('handle.error'));
    },

    CreditsIntent(){
        this.ask("Thanks to RJ and Vlad for programming this using Jovo and Google Sheets. Also thanks to Anita for maintaining the database for this project and Dov for comming up with the idea.");
    },
    
    FallbackIntent(){
        this.ask(this.t('handle.error'));
    },

});

module.exports.app = app;
