CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyUrl` varchar(512) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(64) NOT NULL,
	`district` varchar(64) NOT NULL,
	`floor` varchar(64),
	`price` int NOT NULL,
	`rooms` varchar(64),
	`age` int,
	`hasElevator` boolean DEFAULT false,
	`nearMrt` varchar(256),
	`source` varchar(64),
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
