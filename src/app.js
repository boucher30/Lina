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
const DATE_Index = 1;
const app = new App();

app.use(
    new Alexa(),
    new GoogleSheetsCMS(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

function getSheet(){
    var sheet = app.$cms.QnA.slice();
    return sheet;
}

app.setHandler({
    
    LAUNCH() {
        return this.toIntent('HelloWorldIntent');
    },

    HelloWorldIntent() {
        this.ask('Hello World! What\'s your name?', 'Please tell me your name.');
    },

    MyNameIsIntent() {
        this.tell(this.t(this.$cms.birthdays[1][0]));
    },
    QnAIntent() {
        let sqValue = this.$inputs.SQ.value

        var sheet = getSheet();

        //this.tell(this.t(sheet[0][1]))
        for (let x = 0; x < 2; x++){

            if (this.t(sheet[x][0]) == sqValue){
                this.tell(this.t(sheet[x][1]))
            }
        }
    },
});

module.exports.app = app;
