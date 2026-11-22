export default function CommunityGroups() {
   
    const categoryGroups : any = [
        {title: 'Health Group', membersAmount: 0, containerStyle: 'bg-red-600 text-white'},
        {title: 'Coding Group', membersAmount: 0, containerStyle: 'bg-blue-600 text-white' },
        {title: 'Fitness Group', membersAmount: 0, containerStyle: 'bg-emerald-600 text-white'},
        {title: 'Mindfulness Group', membersAmount: 0, containerStyle: 'bg-purple-600 text-white'},
    ]
   
    return (
        <div>
            <div>
                <h3>Community groups</h3>
                <p>Join a community to participate in group challenges</p>
            </div>

            <div>
                {categoryGroups.map((group: any) => (
                    <div className={`${group.containerStyle}`}>
                        <h3>{group.title}</h3>

                        <div>
                            <p>{group.membersAmount} <span>{group.membersAmount === 1 ? 'member' : 'members'}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
