"use server";

import { driver } from "@/db";
import type { Neo4JUser } from "@/types";

export const getUserByID = async (id: string) => {
	const result = await driver.executeQuery(
		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		`MATCH (u:User {applicationId: $applicationId}) RETURN u`,
		{ applicationId: id },
	);

	const users = result.records.map((record) => record.get("u").properties);
	if (users.length === 0) return null;
	return users[0] as Neo4JUser;
};

export const createUser = async (user: Neo4JUser) => {
	const { applicationId, email, firstName, lastName } = user;

	await driver.executeQuery(
		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		`CREATE (u:User {applicationId: $applicationId, firstName: $firstName, lastName: $lastName, email: $email})`,
		{ applicationId, email, firstName, lastName },
	);
};

export const getUsersWithNoConnection = async (id: string) => {
	const result = await driver.executeQuery(
		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		`MATCH (cu:User {applicationId: $applicationId}) MATCH (ou:User) WHERE NOT (cu)-[:LIKE|:DISLIKE]->(ou) AND cu <> ou RETURN ou`,
		{ applicationId: id },
	);

	return result.records.map(
		(record) => record.get("ou").properties,
	) as Neo4JUser[];
};

export const neo4jSwipe = async (id: string, swipe: string, userId: string) => {
	const type = swipe === "left" ? "DISLIKE" : "LIKE";

	await driver.executeQuery(
		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		`MATCH (cu:User {applicationId: $id}), (ou:User {applicationId: $userId}) CREATE (cu)-[:${type}]->(ou)`,
		{ id, userId },
	);

	if (type === "LIKE") {
		const result = await driver.executeQuery(
			// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
			`MATCH (cu:User {applicationId: $id}), (ou:User {applicationId: $userId}) WHERE (ou)-[:LIKE]->(cu) RETURN ou as match`,
			{ id, userId },
		);

		const matches = result.records.map(
			(record) => record.get("match").properties,
		);
		return Boolean(matches.length > 0);
	}
};

export const getMatches = async (currentUserId: string) => {
	const result = await driver.executeQuery(
		// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
		`MATCH (cu:User {applicationId: $id})-[:LIKE]-(ou:User)-[:LIKE]->(cu) RETURN ou as match`,
		{ id: currentUserId },
	);

	const matches = result.records.map(
		(record) => record.get("match").properties,
	);

	return matches as Neo4JUser[];
};
