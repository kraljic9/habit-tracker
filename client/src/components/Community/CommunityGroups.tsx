import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

export default function CommunityGroups() {

    const [groupData, setGroupData] = useState<any>(null)
    
    const fetchGroupData = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:5000/api/community', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setGroupData(response.data)
        } catch (err) {
            console.log(err, 'Error: failed to fetch group data')
        }
    }

    useEffect(() => {
        fetchGroupData();
    }, [])


    console.log(groupData)

  
    const categoryGroups: any = {
        health: {containerStyle: 'bg-red-600 text-white' },
        coding: {containerStyle: 'bg-blue-600 text-white' },
        fitness: {containerStyle: 'bg-emerald-600 text-white' },
        mindfulness: {containerStyle: 'bg-purple-600 text-white' },
    };

     const addMember = async(id: any) => {
        try {
             const token = localStorage.getItem('token')
                
             await axios.post(
                    `http://localhost:5000/api/community/${id}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

            fetchGroupData()
        } 
        catch(err) {
            console.log(err, 'Error accured while joining group')
        }

    }

    const removeMember = async(id: any) => {
        try {
             const token = localStorage.getItem('token')
                
             await axios.delete(`http://localhost:5000/api/community/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
        })

             fetchGroupData();
        } 
        catch(err) {
            console.log(err, 'Error accured while leaving group')
        }

    }

    return (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-800/90 p-5 text-white shadow-lg">
            <div className="mb-4">
                <h3 className="text-lg font-semibold tracking-tight text-slate-100">Community groups</h3>
                <p className="text-sm text-slate-400">Join a community to participate in group challenges</p>
            </div>

            <div className="space-y-3">
                {groupData?.groups?.map((group: any) => (
                    <div
                        key={group.group_title}
                        className={`${categoryGroups[group.slug].containerStyle} flex items-center justify-between rounded-xl px-4 py-3 shadow-sm`}
                    >
                        <div>
                            <h3 className="text-sm font-semibold tracking-wide">{group.group_title}</h3>
                            <p className="mt-0.5 text-xs font-medium opacity-90">
                                {group.members_count}{' '}
                                <span>{group.members_count=== 1 ? 'member' : 'members'}</span>
                            </p>
                        </div>

                    { !group.is_member ? (
                        <button
                            type="button"
                            className="cursor-pointer rounded-lg bg-slate-900/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-slate-900/55"
                            id={group.id}
                            onClick={() => addMember(group.id)}
                        >
                            Join
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="cursor-pointer rounded-lg bg-slate-900/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-slate-900/55"
                            id={group.id}
                            onClick={() => removeMember(group.id)}
                        >
                            Leave
                        </button>
                    )
                    }
                    </div>
                ))}
            </div>
        </div>
    );
}