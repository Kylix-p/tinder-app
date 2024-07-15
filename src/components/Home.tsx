"use client";

// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import type { Neo4JUser } from "../types";
import TinderCard from "react-tinder-card";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { neo4jSwipe } from "@/app/neo4j.action";

interface HomePageClientComponentProps {
	currentUser: Neo4JUser;
	users: Neo4JUser[];
}

const HomePageClientComponent: React.FC<HomePageClientComponentProps> = ({
	currentUser,
	users,
}) => {
	const handleSwipe = async (direction: string, userID: string) => {
		const isMatch = await neo4jSwipe(
			currentUser.applicationId,
			direction,
			userID,
		);
		if (isMatch) {
			alert("Congratulations! It's a match!");
		}
	};

	return (
		<div className="w-screen h-screen flex justify-center items-center">
			<div>
				<div>
					<h1 className="text-4xl">
						Hello {currentUser.firstName} {currentUser.lastName}
					</h1>
				</div>
				<div className="mt-4 relative">
					{users.map((user) => (
						<TinderCard
							onSwipe={(direction) =>
								handleSwipe(direction, user.applicationId)
							}
							className="absolute"
							key={user.applicationId}
						>
							<Card>
								<CardHeader>
									<CardTitle>
										{user.firstName} {user.lastName}
									</CardTitle>
									<CardDescription>{user.email}</CardDescription>
								</CardHeader>
							</Card>
						</TinderCard>
					))}
				</div>
			</div>
		</div>
	);
};

export default HomePageClientComponent;
