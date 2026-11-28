import axios from "axios";
import { useEffect, useState } from "react";

export default function MileStones() {
        
        const [milestonesList, setMilestonesList] = useState<any>(null);
        
        useEffect(() => {
                const fetchMilestoneData = async () => {
                        try{
                        
                        const token = localStorage.getItem('token');

                        const response = await axios.get('http://localhost:5000/api/community/milestones', {
                                headers: {
                                        Authorization: `Bearer ${token}`
                                }
                        })
                        
                        setMilestonesList(response.data)

                        } catch(err) {
                                console.log('Error accured while fetching milestones data')
                                console.log(err)
                        }
                }

                fetchMilestoneData();
        }, [])

        async function addReaction (id: number) {
                try{
                        await axios.post(`/milestones/${id}/reactions`)
                } 
                catch(err) {
                        console.log('Error accured while fetching milestones data')
                        console.log(err)
                }
        }

        async function removeReaction (id: number) {
                try{
                        await axios.post(`/milestones/${id}/reactions`)
                } 
                catch(err) {
                        console.log('Error accured while fetching milestones data')
                        console.log(err)
                }
        }

        console.log(milestonesList)

        return (
                <>
        <div>
                <h3>Milestone feed</h3>

                <div>
                        {milestonesList?.milestones.map((milestone : any) => (
                                <div key={milestone.id}>
                                        <div></div>

                                        <div>
                                          <p>{milestone.message}</p>

                                          <div>
                                                {!milestone.liked_by_me 
                                                ? 
                                                <button onClick={() => addReaction(milestone.id)}>👏{milestone.reaction_count}</button> 
                                                : 
                                                <button onClick={() => removeReaction(milestone.id)}>👏{milestone.reaction_count}</button>       
                                        }
                                          </div>
                                        </div>
                                </div>
                        ))}
                </div>
        </div>
                </>
        )

}
