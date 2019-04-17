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
var sleep = require('sleep');

//Declare Sheet global constants here
const NAME_INDEX = 0;
const DATE_INDEX = 1;
const POINTS_INDEX = 1;
const NUM_OF_ANNOUNCEMENTS_INDEX = 1;
const SpliceIndex = 2;

const app = new App();

app.use(
    new Alexa(),
    new GoogleSheetsCMS(),
    new JovoDebugger(),
    new FileDb()
);

//Point app to the desired sheet to get required data
function dateCheck(from,to,check) {

    var fDate,lDate,cDate;
    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if((cDate <= lDate && cDate >= fDate)) {
        return true;
    }
    return false;
}
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
    /*
    if(dateCheck("02/05/2013","02/09/2013","02/07/2013"))
        alert("Availed");
    else
        alert("Not Availed");
    */
    BirthdayIntent() {
        var sheet = getSheet("birthdays");
        let name = this.$inputs.name.value;
        let noBirthday = true;
        for(let j = 1; j < sheet.length; j++){
            let nameInSheet = sheet[j][NAME_INDEX];
            if(name === nameInSheet){
                noBirthday = false;
                let birthday = sheet[j][DATE_INDEX];
                let currentDate = new Date();
                
                let today = String(currentDate.getDate()).padStart(2,'0'); //getDay() method seems to return the wrong day sometimes so heres a workaround
                let month = currentDate.getMonth() + 1;
                console.log(today + " " + month + "\n");
                let monthInSheet = birthday.substring(0,2);
                let dayInSheet = birthday.substring(3,5);
                console.log(monthInSheet + " " + dayInSheet);
                console.log(dayInSheet.includes(today) && monthInSheet.includes(month));
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
            this.$x.addText("There are none today.")
        }
        this.ask(this.$speech);
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
    },
    DisplayTestIntent(){
        let title = 'PICA CHUUUUUUUUU';
        let content = 'PICA CHUUUUUUUUUUUUUUU';
        let imageUrl = 'https://s3.amazonaws.com/lina1234/tenor.gif';

        this.showImageCard(title, content, imageUrl)
            .tell('This is the PICA CHUUUUUUUUU');
            //sleep.msleep(10000);
    },
    SuperSecretIntent(){
        let code = this.$inputs.code.value;
        if (code === "1234"){
            this.ask(`According to all known laws of aviation, there is no way that a bee should be able to fly. Its wings are too small to get its fat little body off the ground. The bee, of course, flies anyway. Because bees don’t care what humans think is impossible.” SEQ. 75 - “INTRO TO BARRY” INT. BENSON HOUSE - DAY ANGLE ON: 
            Sneakers on the ground. Camera PANS UP to reveal BARRY BENSON’S BEDROOM ANGLE ON: Barry’s hand flipping through different sweaters in his closet. BARRY Yellow black, yellow black, yellow black, yellow black, yellow black, yellow black...oohh, black and yellow... ANGLE ON: Barry wearing the sweater he picked, looking in
             the mirror. BARRY (CONT’D) Yeah, let’s shake it up a little. He picks the black and yellow one. He then goes to the sink, takes the top off a CONTAINER OF HONEY, and puts some honey into his hair. He squirts some in his mouth and gargles. Then he takes the lid off the bottle, and rolls some on like deodorant. CUT TO: INT. 
             BENSON HOUSE KITCHEN - CONTINUOUS Barry’s mother, JANET BENSON, yells up at Barry. JANET BENSON Barry, breakfast is ready! CUT TO: "Bee Movie" - JS REVISIONS 8/13/07 1. INT. BARRY’S ROOM - CONTINUOUS BARRY Coming! SFX: Phone RINGING. Barry’s antennae vibrate as they RING like a phone. Barry’s hands are wet. He looks around for a 
             towel. BARRY (CONT’D) Hang on a second! He wipes his hands on his sweater, and pulls his antennae down to his ear and mouth. BARRY (CONT'D) Hello? His best friend, ADAM FLAYMAN, is on the other end. ADAM Barry? BARRY Adam? ADAM Can you believe this is happening? BARRY Can’t believe it. I’ll pick you up. Barry sticks his stinger in a sharpener. 
             SFX: BUZZING AS HIS STINGER IS SHARPENED. He tests the sharpness with his finger. SFX: Bing. BARRY (CONT’D) Looking sharp. ANGLE ON: Barry hovering down the hall, sliding down the staircase bannister. Barry’s mother, JANET BENSON, is in the kitchen. JANET BENSON Barry, why don’t you use the stairs? Your father paid good money for those. "Bee Movie"
              - JS REVISIONS 8/13/07 2. BARRY Sorry, I’m excited. Barry’s father, MARTIN BENSON, ENTERS. He’s reading a NEWSPAPER with the HEADLINE, “Queen gives birth to thousandtuplets: Resting Comfortably.” MARTIN BENSON Here’s the graduate. We’re very proud of you, Son. And a perfect report card, all B’s. JANET BENSON (mushing Barry’s hair) Very proud. BARRY Ma!
            I’ve got a thing going here. Barry re-adjusts his hair, starts to leave. JANET BENSON You’ve got some lint on your fuzz. She picks it off. BARRY Ow, that’s me! MARTIN BENSON Wave to us. We’ll be in row 118,000. Barry zips off. BARRY Bye! JANET BENSON Barry, I told you, stop flying in the house! CUT TO: SEQ. 750 - DRIVING TO GRADUATION EXT. BEE SUBURB - MORNING A
             GARAGE DOOR OPENS. Barry drives out in his CAR. "Bee Movie" - JS REVISIONS 8/13/07 3. ANGLE ON: Barry’s friend, ADAM FLAYMAN, standing by the curb. He’s reading a NEWSPAPER with the HEADLINE: “Frisbee Hits Hive: Internet Down. Bee-stander: “I heard a sound, and next thing I knew...wham-o!.” Barry drives up, stops in front of Adam. Adam jumps in. BARRY Hey, Adam. ADAM Hey,
              Barry. (pointing at Barry’s hair) Is that fuzz gel? BARRY A little. It’s a special day. Finally graduating. ADAM I never thought I’d make it. BARRY Yeah, three days of grade school, three days of high school. ADAM Those were so awkward. BARRY Three days of college. I’m glad I took off one day in the middle and just hitchhiked around the hive. ADAM You did come back different.
               They drive by a bee who’s jogging. ARTIE Hi Barry! BARRY (to a bee pedestrian) Hey Artie, growing a mustache? Looks good. Barry and Adam drive from the suburbs into the city. ADAM Hey, did you hear about Frankie? "Bee Movie" - JS REVISIONS 8/13/07 4. BARRY Yeah. ADAM You going to his funeral? BARRY No, I’m not going to his funeral. Everybody knows you sting someone you die
               , you don’t waste it on a squirrel. He was such a hot head. ADAM Yeah, I guess he could’ve just gotten out of the way. 
               The DRIVE through a loop de loop. BARRY AND ADAM Whoa...Whooo...wheee!! ADAM I love this incorporating the amusement park right into our regular day. BARRY I guess that’s why they say we don’t need vacations. CUT TO: SEQ. 95 - GRADUATION EXT. GRADUATION CEREMONY - CONTINUOUS Barry and Adam come to a stop. They exit the car, and fly over the crowd to their seats. * BARRY * (re: graduation ceremony) 
               * Boy, quite a bit of pomp...under * the circumstances. * They land in their seats. BARRY (CONT’D) Well Adam, today we are men. "Bee Movie" - JS REVISIONS 8/13/07 5. ADAM We are. BARRY Bee-men. ADAM Amen! BARRY Hallelujah. Barry hits Adam’s forehead. Adam goes into the rapture. An announcement comes over the PA. ANNOUNCER (V.O) Students, faculty, distinguished bees...please welcome, Dean Buzzwell. 
               ANGLE ON: DEAN BUZZWELL steps up to the podium. The podium has a sign that reads: “Welcome Graduating Class of:”, with train-station style flipping numbers after it. BUZZWELL Welcome New Hive City graduating class of... The numbers on the podium change to 9:15. BUZZWELL (CONT’D) ...9:15. (he clears his throat) And that concludes our graduation ceremonies. And begins your career at Honex Industries. 
               BARRY Are we going to pick our job today? ADAM I heard it’s just orientation. The rows of chairs change in transformer-like mechanical motion to Universal Studios type tour trams. Buzzwell walks off stage. BARRY (re: trams) Whoa, heads up! Here we go. "Bee Movie" - JS REVISIONS 8/13/07 6. SEQ. 125 - “FACTORY” FEMALE VOICE (V.O) Keep your hands and antennas inside the tram at all times. (in Spanish) Dejen las manos y antennas adentro del tram a todos tiempos. BARRY 
               I wonder what it’s going to be like? ADAM A little scary. Barry shakes Adam. BARRY AND ADAM AAHHHH! The tram passes under SIGNS READING: “Honex: A Division of Honesco: A Part of the Hexagon Group.” TRUDY Welcome to Honex, a division of Honesco, and a part of the Hexagon group. BARRY This is it! The Honex doors OPEN, revealing the factory. BARRY (CONT’D) Wow. TRUDY We know that you, as a bee, have worked your whole life to get to the point where you can work for your 
               whole life. Honey begins when our valiant pollen jocks bring the nectar to the hive where our top secret formula is automatically color-corrected, scent adjusted and bubble contoured into this... Trudy GRABS a TEST TUBE OF HONEY from a technician. "Bee Movie" - JS REVISIONS 8/13/07 7. TRUDY (CONT’D) ...soothing, sweet syrup with its distinctive golden glow, you all know as... EVERYONE ON THE TRAM (in unison) H-o-n-e-y. Trudy flips the flask into the crowd, and laughs as they all scramble for it. 
               ANGLE ON: A GIRL BEE catching the honey. ADAM (sotto) That girl was hot. BARRY (sotto) She’s my cousin. ADAM She is? BARRY Yes, we’re all cousins. ADAM Right. You’re right. TRUDY At Honex, we also constantly strive to improve every aspect of bee existence. These bees are stress testing a new helmet technology. ANGLE ON: A STUNT BEE in a HELMET getting hit with a NEWSPAPER, then a SHOE, then a FLYSWATTER. He gets up, and gives a “thumb’s up”. The graduate bees APPLAUD. ADAM (re: stunt bee) What do 
               you think he makes? BARRY Not enough. TRUDY And here we have our latest advancement, the Krelman. "Bee Movie" - JS REVISIONS 8/13/07 8. BARRY Wow, what does that do? TRUDY Catches that little strand of honey that hangs after you pour it. Saves us millions. ANGLE ON: The Krelman machine. Bees with hand-shaped hats on, rotating around a wheel to catch drips of honey. Adam’s hand shoots up. ADAM Can anyone work on the Krelman? TRUDY Of course. Most bee jobs are small ones. But bees know that every small job, if it’s
                done well, means a lot. There are over 3000 different bee occupations. But choose carefully, because you’ll stay in the job that you pick for the rest of your life. The bees CHEER. ANGLE ON: Barry’s smile dropping slightly. BARRY The same job for the rest of your life? I didn’t know that. ADAM What’s the difference? TRUDY And you’ll be happy to know that bees as a species haven’t had one day off in 27 million years. BARRY So you’ll just work us to death? TRUDY (laughing) We’ll sure try. Everyone LAUGHS except Barry.
                 "Bee Movie" - JS REVISIONS 8/13/07 9. The tram drops down a log-flume type steep drop. Cameras flash, as all the bees throw up their hands. The frame freezes into a snapshot. Barry looks concerned. The tram continues through 2 doors. FORM DISSOLVE TO: SEQ. 175 - “WALKING THE HIVE” INT. HONEX LOBBY ANGLE ON: The log-flume photo, as Barry looks at it. ADAM Wow. That blew my mind. BARRY (annoyed) “What’s the difference?” Adam, how could you say that? One job forever? That’s an insane choice to have to make. ADAM Well, I’m relieved. Now we only 
                 have to make one decision in life. BARRY But Adam, how could they never have told us that? ADAM Barry, why would you question anything? We’re bees. We’re the most perfectly functioning society on Earth. They walk by a newspaper stand with A SANDWICH BOARD READING: “Bee Goes Berserk: Stings Seven Then Self.” ANGLE ON: A BEE filling his car’s gas tank from a honey pump. He fills his car some, then takes a swig for himself. NEWSPAPER BEE (to the bee guzzling gas) Hey! Barry and Adam begin to cross the street. "Bee Movie" - JS REVISIONS 8/13/07 10. 
                 BARRY Yeah but Adam, did you ever think that maybe things work a little too well around here? They stop in the middle of the street. The traffic moves perfectly around them. ADAM Like what? Give me one example. BARRY (thinks) ...I don’t know. But you know what I’m talking about. They walk off. SEQ. 400 - “MEET THE JOCKS” SFX: The SOUND of Pollen Jocks. PAN DOWN from the Honex statue. J-GATE ANNOUNCER Please clear the gate. Royal Nectar Force on approach. Royal Nectar Force on approach. BARRY Wait a second. Check it out.
                  Hey, hey, those are Pollen jocks. ADAM Wow. FOUR PATROL BEES FLY in through the hive’s giant Gothic entrance. The Patrol Bees are wearing fighter pilot helmets with black visors. ADAM (CONT’D) I’ve never seen them this close. BARRY They know what it’s like to go outside the hive. ADAM Yeah, but some of them don’t come back. "Bee Movie" - JS REVISIONS 8/13/07 11. The nectar from the pollen jocks is removed from their backpacks, and loaded into trucks on their way to Honex. A SMALL CROWD forms around the Patrol Bees. Each one has a PIT CREW that takes their nectar. Lou Loduca
                   hurries a pit crew along: LOU LODUCA You guys did great! You’re monsters. You’re sky freaks! I love it! I love it! SCHOOL GIRLS are jumping up and down and squealing nearby. BARRY I wonder where those guys have just been? ADAM I don’t know. BARRY Their day’s not planned.
                    Outside the hive, flying who-knows-where, doing who-knows-what. ADAM You can’t just decide one day to be a Pollen Jock. You have to be bred for that. BARRY Right. Pollen Jocks cross in close proximity to Barry and Adam. Some pollen falls off, onto Barry and Adam. BARRY (CONT’D) Look at that. That’s more pollen than you and I will ever see in a lifetime. ADAM (playing with the pollen) It’s just a status symbol. I think bees make too big a deal out of it. BARRY Perhaps, unless you’re wearing it, and the ladies see you wearing it. ANGLE ON: Two girl bees. "Bee Movie" - JS REVISIONS 8/13/07 12. ADAM Those ladies? Aren’t they our cousins too? BARRY Distant, distant. ANGLE ON: TWO POLLEN JOCKS. JACKSON Look at these two. SPLITZ Couple of Hive Harrys. `);
        }
    },
    BirthdayWMIntent(){
        var sheet = getSheet("birthdays");
        let thing = this.$inputs.thing.value;
        if (thing === "month"){
            var today = new Date();
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! //MDY
            let thismonth = mm + '/' + "01";
            console.log(mm);
            let mmp1 = parseInt(mm) + 1;
            let mmp1s = "0" + String(mmp1)
            console.log(mmp1s);
            let nextmonth = mmp1s + '/' + "01";
            console.log(nextmonth + "   " + thismonth);
            console.log(String(parseInt(NAME_INDEX+2)));
            for(let x = 1; x < sheet.length; x++){
                if(dateCheck(thismonth,nextmonth,sheet[x][SpliceIndex]))//from to check
                console.log(sheet[x][NAME_INDEX]);
            else
                console.log(sheet[x][NAME_INDEX]);
                console.log(sheet[x][SpliceIndex]);
            }
        }else{

        }
    }
});

module.exports.app = app;
