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

app.setHandler({
    
    LAUNCH() {
        return this.toIntent('BirthdayIntent');
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
        this.tell(this.$speech);
    },
    QnAIntent() {
        let sqValue = this.$inputs.SQ.value

        var sheet = getSheet2();

        //this.tell(this.t(sheet[0][1]))
        for (let x = 0; x < 2; x++){

            if (this.t(sheet[x][0]) == sqValue){
                this.tell(this.t(sheet[x][1]))
            }
        }
    },
});

module.exports.app = app;
