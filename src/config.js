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
            access: 'private',
            credentialsFile: './credentials/creds.json',
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
                {
                    name: 'QnA',
                    position: 3,
                },
                {
                    name: 'Announcements',
                    position: 4,
                },
            ]
        }
    },
 };
 