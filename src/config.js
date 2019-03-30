// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,
 
    intentMap: {
       'AMAZON.StopIntent': 'END',
    },
 
    db: {
         FileDb: {
             pathToFile: '../db/db.json',
         }
     },

     cms: {
        GoogleSheetsCMS: {
            spreadsheetId: '1sBMAepx5JS_35CvV44BCsweZi-5AGAxD-7vvGLKxAh0',
            access: 'public',
            sheets: [
                {
                    name: 'birthdays',
                    position: 1,
                },
                {
                    name: 'responses',
                    type: 'Responses',
                    position: 2,
                },
            ]
        }
    },
 };
 