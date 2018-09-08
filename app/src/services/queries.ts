export const getPlayerWithName = 'SELECT name, id, password FROM player WHERE name = $1::text'
export const addPlayer = 'INSERT INTO player VALUES ($1::text, $2::text)'
export const getAllPlayersExcept = `
	SELECT name, id
	FROM player
	WHERE is_deleted = false AND NOT id = $1::int`
export const addGame = 'INSERT INTO game VALUES ($1::int, $2::int, $3::int, $4::int)'
export const getOpponents = `
SELECT opponents.id as id, opponents.name as name, SUM(opponents.amount) as amount
FROM (
    SELECT o.id as id, o.name as name, g.amount as amount
    FROM
        (SELECT loser as id, SUM(amount) as amount
        FROM game
        WHERE winner = $1::int
        GROUP BY loser) as g,
        (SELECT id, name
        FROM player) as o
    WHERE o.id = g.id
    UNION ALL
    SELECT o.id as id, o.name as name, g.amount as amount
    FROM
        (SELECT winner as id, SUM(-amount) as amount
        FROM game
        WHERE loser = $1::int
        GROUP BY winner) as g,
        (SELECT id, name
        FROM player) as o
    WHERE o.id = g.id
    ) as opponents
GROUP BY opponents.id, opponents.name;`
export const getTotalSum = `
SELECT SUM(agg.amount) as sum
FROM 
    ((SELECT amount
    FROM game
    WHERE winner = $1::int)
    UNION ALL
    (SELECT -amount as amount
    FROM game
    WHERE loser = $1::int)) as agg`
