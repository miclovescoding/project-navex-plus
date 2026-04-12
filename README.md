# Navex+

> A geospatial decision-support and information system for military route planning.

Navex+ is a full-stack analytics and information system built during Singapore National Service to solve a real operational planning problem: how do you plan safe, realistic navigation routes in areas where commercial maps do not exist?

Developed independently after Harvard CS50P, the platform combines geospatial data pipelines, optimisation, and AI-assisted decision support into a system designed for real users in real training environments.

## Information Systems Gap

Military training areas are intentionally absent from commercial mapping platforms.  
As a result, navigation planning relies heavily on manual workflows using paper maps and straight-line distance calculations.

This creates an information gap:
- Planners lack digital tools tailored for restricted environments
- Existing systems are not designed for field navigation workflows
- Valuable navigation knowledge is not captured or reused

Navex+ was built to function as a **specialised information system** that digitises and improves this workflow.

## Information Systems Design

Navex+ is designed as a complete end-to-end system rather than a standalone tool.

### Data Layer
- Integration of multiple open geospatial map providers
- Replacement of paid APIs with open-source data pipelines
- Coordinate conversion backend using Python and pyproj

### Application Layer
- Interactive web interface for planning and visualisation
- Real-time editing of checkpoints and routes
- Automatic generation of navigation data (NDS)

### Decision Support Layer
- Future AI features designed to assist human planners
- Route comparison and terrain difficulty insights
- Natural-language navigation briefings

The system captures, processes, and enhances navigation knowledge that was previously manual and fragmented.

## AI-Assisted Decision Support

Navex+ explores how AI can support human decision-making in operational planning.

Planned AI features include:

**Route Briefing Generator**  
Converts technical navigation data into plain-language pre-navigation briefings to improve communication between planners and soldiers.

**Terrain Difficulty Insights**  
Predicts the difficulty of route segments using elevation and terrain features to support risk-aware planning.

**Satellite-Based Checkpoint Suggestions**  
Explores computer vision techniques to identify potential landmarks from satellite imagery, reducing manual planning effort.

These features focus on augmenting human decision-making rather than replacing it.

## Origin During National Service

Navex+ was self-initiated during full-time National Service after identifying a real workflow inefficiency in military navigation planning.

The project was developed independently outside working hours with no formal computing education beyond Harvard’s CS50P.

It represents an initiative to digitise and improve a real operational workflow using analytics and information systems thinking.

## Future System Vision

Navex+ aims to evolve into a collaborative navigation platform:

- Route saving and comparison across exercises
- Crowdsourced path data from soldiers in the field
- Continuous improvement of route planning insights

The long-term vision is a data-driven navigation platform that improves with every route planned and executed.  

## Acknowledgements

This project builds upon the open-source Project Navex:
https://github.com/projectnavex/project-navex-2

Original authors:
- Alex — https://github.com/Airiinnn
- Wuihee — https://github.com/wuihee

Navex+ significantly extends the original project with a new frontend, backend, geospatial pipeline, and planned AI-assisted features.