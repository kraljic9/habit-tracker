import {Pool} from 'pg';

const pool = new Pool({
    user: 'postgres',
    password: 'pavlebasket',
    host: 'localhost',
    database: 'habit_tracker_db',
    port: 5432,
})

export default pool

