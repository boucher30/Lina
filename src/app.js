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

function getSheet(){
    var sheet = app.$cms.birthdays.slice();
    return sheet;
}
// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    
    LAUNCH() {
        return this.toIntent('BirthdayIntent');
    },

    BirthdayIntent() {
        var sheet = getSheet();
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
});

module.exports.app = app;
