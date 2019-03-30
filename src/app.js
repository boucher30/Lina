'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const { GoogleSheetsCMS } = require('jovo-cms-googlesheets');

const NAME_INDEX = 0;
const DATE_INDEX = 1;
const app = new App();

app.use(
    new Alexa(),
    new GoogleSheetsCMS(),
    new JovoDebugger(),
    new FileDb()
);

function getSheet1(){
    var sheet = app.$cms.birthdays.slice();
    return sheet;
}
// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

function getSheet2(){
    var sheet = app.$cms.QnA.slice();
    return sheet;
}
function getSheet3(){
    var sheet = app.$cms.announcements.slice();
    return sheet;
}
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
        var sheet = getSheet1();
        let name = this.$inputs.name.value;
        for(let j = 1; j < sheet.length; j++){
            let value = sheet[j][NAME_INDEX];
            if(name === value){
                let date = sheet[j][DATE_INDEX];
                this.$speech.addT('response.birthday', {name, date})
            }
        }
        this.ask(this.$speech);
    },
    QnAIntent() {
        let sqValue = this.$inputs.SQ.value

        var sheet = getSheet2();

        //this.tell(this.t(sheet[0][1]))
        for (let x = 0; x < sheet.length; x++){

            if (this.t(sheet[x][0]) == sqValue){
                this.ask(this.t(sheet[x][1]))
            }
        }
    },
    announcementsIntent(){
        //let sqValue = this.$inputs.SQ.value

        var sheet = getSheet3();

        var datetoday = getToDate();
        for (let x = 0; x < sheet.length; x++){

            if (this.t(sheet[x][0]) == datetoday){
                this.ask(this.t(sheet[x][1]))
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
});

module.exports.app = app;
