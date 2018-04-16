        function convert() {
          var reader = new window.FileReader();
        	reader.readAsText(uploadedSubtitles.files[0]);
        	console.log(reader);
        	reader.onload=onReadSrt;
        }

        function onReadSrt(event, text) {
          text = event.target.result;
          output = document.getElementById("subt");
          webvtt = srt2webvtt(text);
          output.innerHTML = "<textarea rows=20 cols=80>"+webvtt+"</textarea>";
        }

        function srt2webvtt(data) {
          // remove dos newlines
          console.log(data);
          var srt = data.replace(/\r+/g, '');
          // trim white space start and end
          console.log(srt);
          srt = srt.replace(/^\s+|\s+$/g, '');
          console.log(srt);
          // get cues
          var cuelist = srt.split('\n\n');
          console.log(cuelist);
          var result = "";

          if (cuelist.length > 0) {
            result += "WEBVTT\n\n";
            for (var i = 0; i < cuelist.length; i=i+1) {
              result += convertSrtCue(cuelist[i]);
            }
          }

          return result;
        }

        function convertSrtCue(caption) {
          // remove all html tags for security reasons
          //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

          var cue = "";
          var s = caption.split(/\n/);
          while (s.length > 3) {
            s[2] += '\n' + s.pop();
          }
          var line = 0;

          // detect identifier
          if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
            cue += s[0].match(/\w+/) + "\n";
            line += 1;
          }

          // get time strings
          if (s[line].match(/\d+:\d+:\d+/)) {
            // convert time string
            var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
            if (m) {
              cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
                    +m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
              line += 1;
            } else {
              // Unrecognized timestring
              return "";
            }
          } else {
            // file format error or comment lines
            return "";
          }

          // get cue text
          if (s[line]) {
            cue += s[line] + "\n\n";
          }

          return cue;
        }
