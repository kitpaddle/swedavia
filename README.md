# Stockholm Arlanda Airport Statistics

This project's goal was to learn and improve on some of my programming skills.
More particularly data-analysis, data visualisation (D3-library), working with API's (Swedavia API - open-source), fullstack arhcitecture (nodeJS) and databases (mongoDB). The project makes use of all these components.

The website shows real-time and accurate data and statistics for Stockholm Arlanda Airport.
By using the small menu, the user can choose the date as well as the traffic type (Arrivals, Departure, or Mixed).
The data is then visualised in multiple ways to highlight different information and variables.

Particular focus is given to delays and how they relate to different variables (by location or by airline or by arrivals/departures) and so on.

At the moment the website is built as following:

NodeJS express server is the "heart" of the website. All API calls go through the server (middleware) as the Swedavia API can not be accessed by clients directly. The server also communicates with the mongoDB database and ensures data not already saved there is saved there at least once a day. The server also holds a small cache of data so as to reduce calls to the database. However, at the moment no calculations/data-analysis takes place on the server. And this is probably a change I'll make in the next iteration. The data requested by the website (the client, HTML/Javascript/CSS) is sent in JSON to the client and all the data analysis and visualisation is done on the client side.

Ideas for future updates when I have time:
- Make alla analysis on server and only use client for visualisation/presentation.
- Add loading symbol showing on clientside when data is being requested by client as it can take a few seconds (sometimes up to 10-20 seconds depending on the server having to "wake up" as it is currently located on Glitch for free)
- Add on clientside more visualisation that analyses the turn-around time for each flight that has a planned turn-around and see how many of those are delayed.
- Add clientside more vusalisation that show trend over a week or even a month to get better overviews of certain statistics over time as they all are presented per day at the moment.
