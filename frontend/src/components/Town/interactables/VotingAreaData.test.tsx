import axios from "axios"


const submitVote = () => {
    axios
}

/**
 * Code to be implemented
 * 
 * Given that at the creation of this, we do not have a functional React Component for the
 * VotingArea, I will be putting what code would go in the component below.  
 * Since we are using MockAPI for data collection pertaining to votes,
 * any data collected will be posted to API endpoint: https://6553eb685449cfda0f2f4a9d.mockapi.io/vote
 * I intend to put this code into the front end once it is posted to GitHub, but until then, this will do.  
 * 
 * NOTE: this code is subject to change, as the front end is not finished at this moment.
 *   I will adjust the code to fit into the votingArea React Component. 
 * 
 * const submitVote = () => {
 *      axios
 *          .post("https://6553eb685449cfda0f2f4a9d.mockapi.io/vote", {
 *              // this is subject to change, depending on the amount of voting options
 *              voteA: voteForA, 
 *              voteB: voteForB, 
 *              voteC: voteForC, 
 *              voteD; voteForD
 *          })
 *          .then(
 *              (response) => {
 *                  console.log(response);
 *              }, 
 *              (error) => {
 *                  console.log(error);
 *              }
 *         );
 * };
 * 
 * 
 * // code to be implemented in the button which a user clicks to submit their vote 
 * // (note this is very bare bones):
 * 
 *          <Buton color="red" inverted onClick={() => [setOpen(false), submiteVote()]}>
 *              <icon name="foobar" /> yes
 *          </Button>
 * 
 * // Once the above code is done, the information containing the vote will get send to the URL
 * // mentioned above, and the data presented at that URL will look something similar to this:
 * [
 *    {
 *      "id":"1"
 *      "createdAt": "2023-11-16T12:00:00.458Z
 *      "name":  "A Name"
 *      "avatar": "some URL"
 *      "voteA": 0, 
 *      "VoteB": 0,
 *      "VoteC": 1,
 *      "VoteD": 0
 *   }
 *   {
 *      "id":"2"
 *      "createdAt": "2023-11-16T12:01:00.458Z
 *      "name":  "Another Name"
 *      "avatar": "some URL"
 *      "voteA": 1, 
 *      "VoteB": 0,
 *      "VoteC": 1,
 *      "VoteD": 0
 *   }
 * ]
 * 
 * // If we were to need to use the backend (MockAPI) to display the data at the end of a vote:
 * 
 * const Result = () => {
 *      const [results, setResults] = useState([]);
 *      
 *      useEffect(() => {
 *          axios.get("https://6553eb685449cfda0f2f4a9d.mockapi.io/vote").then(
 *              (response) => {
 *                  console.log(response.data);
 *                  setResults(response.data);
 *              }, 
 *                (error) => {
 *                  console.log(error);
 *                }
 *              );
 *          }, []);
 *      
 *      const totalVotesForA = results.map((item) => item.VoteA);
 *      const totalVotesForB = results.map((item) => item.VoteB);
 *      const totalVotesForC = results.map((item) => item.VoteC);
 *      const totalVotesForD = results.map((item) => item.VoteD);
 * 
 *      return <>{}</>;
 * }
 * 
 */

/**
 * Testing
 * 
 * Since the front end of things is not yet pushed, it is hard to write real tests
 * of how MockAPI will receive the data. So, this is a boiler plate of what 
 * the tests might look like:
 * 
 * import VotingComponent from ./VotingComponent
 * 
 * jest.mock('axios'); 
 * 
 * describe('VotingComponent', () => {
 *      it ('sends a vote to the MockAPI on vote submission, async () => {
 *      const mockPost = axios.post.mockResolvedValue({ data: //mock data } });
 *          //rendering voting component
 *          //then, simulating a user action that triggers submitVote
 *          
 * 
 *      // checking axios.post was called correctly
 *      expect(mockPost).toHaveBeenCalledWith("https://6553eb685449cfda0f2f4a9d.mockapi.io/vote", {
 *          voteA: //expected value,
 *          voteB: //expected value,
 *          voteC: //expected value,
 *          voteD: //expected value              
 *      });
 *   });
 * 
 * // Then we would want to test for any error handling, which is hard to do at this time.  
 * // Additionally we would want to test different voting scnearios.
 * 
 * 
 * 
 * 
 * 
 * 
 */

