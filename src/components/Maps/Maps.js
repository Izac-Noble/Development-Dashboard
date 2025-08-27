import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Info, MapPin, Users, Building } from 'lucide-react';

const UgandaMap = () => {
  const svgRef = useRef();
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tooltip state (React-driven)
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    district: null,
  });

  // Mock Uganda districts data with coordinates and statistics
  const ugandaDistrictsData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Kampala",
          region: "Central",
          population: 1680000,
          hospitals: 15,
          schools: 450,
          area: 189,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[32.5, 0.3], [32.7, 0.3], [32.7, 0.4], [32.5, 0.4], [32.5, 0.3]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Wakiso",
          region: "Central",
          population: 2007700,
          hospitals: 8,
          schools: 380,
          area: 2807,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[32.3, 0.2], [32.8, 0.2], [32.8, 0.5], [32.3, 0.5], [32.3, 0.2]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Mukono",
          region: "Central",
          population: 596804,
          hospitals: 5,
          schools: 220,
          area: 1982,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[32.7, 0.2], [33.0, 0.2], [33.0, 0.4], [32.7, 0.4], [32.7, 0.2]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Mbarara",
          region: "Western",
          population: 195013,
          hospitals: 6,
          schools: 180,
          area: 1846,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[30.5, -0.8], [30.8, -0.8], [30.8, -0.5], [30.5, -0.5], [30.5, -0.8]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Kasese",
          region: "Western",
          population: 702029,
          hospitals: 4,
          schools: 160,
          area: 2723,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[29.8, 0.0], [30.3, 0.0], [30.3, 0.3], [29.8, 0.3], [29.8, 0.0]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Jinja",
          region: "Eastern",
          population: 471242,
          hospitals: 5,
          schools: 140,
          area: 238,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[33.1, 0.3], [33.4, 0.3], [33.4, 0.5], [33.1, 0.5], [33.1, 0.3]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Mbale",
          region: "Eastern",
          population: 488900,
          hospitals: 4,
          schools: 190,
          area: 2466,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[34.1, 0.8], [34.4, 0.8], [34.4, 1.1], [34.1, 1.1], [34.1, 0.8]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Gulu",
          region: "Northern",
          population: 194013,
          hospitals: 3,
          schools: 120,
          area: 3206,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[32.2, 2.6], [32.5, 2.6], [32.5, 2.9], [32.2, 2.9], [32.2, 2.6]]],
        },
      },
      {
        type: "Feature",
        properties: {
          name: "Lira",
          region: "Northern",
          population: 408043,
          hospitals: 3,
          schools: 150,
          area: 7211,
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[32.8, 2.2], [33.1, 2.2], [33.1, 2.5], [32.8, 2.5], [32.8, 2.2]]],
        },
      },
    ],
  };

  // Color scheme for regions
  const regionColors = {
    Central: "#3B82F6",
    Western: "#10B981",
    Eastern: "#F59E0B",
    Northern: "#EF4444",
  };

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
        setMapData(ugandaDistrictsData);
        setError(null);
      } catch (err) {
        setError("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  useEffect(() => {
    if (!mapData || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    const projection = d3.geoMercator()
      .center([32.5, 1.0])
      .scale(8000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.selectAll(".district")
      .data(mapData.features)
      .join("path")
      .attr("class", "district")
      .attr("d", path)
      .style("fill", d => regionColors[d.properties.region] || "#6B7280")
      .style("stroke", "#374151")
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .style("opacity", 0.7)
      .on("mouseenter", function (event, d) {
        d3.select(this).style("opacity", 1).style("stroke-width", 2);
        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          district: d.properties,
        });
      })
      .on("mousemove", function (event) {
        setTooltip(prev => ({ ...prev, x: event.pageX, y: event.pageY }));
      })
      .on("mouseleave", function () {
        d3.select(this).style("opacity", 0.7).style("stroke-width", 1);
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .on("click", function (event, d) {
        setSelectedDistrict(d.properties);
      });

    svg.selectAll(".district-label")
      .data(mapData.features)
      .join("text")
      .attr("class", "district-label")
      .attr("x", d => path.centroid(d)[0])
      .attr("y", d => path.centroid(d)[1])
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(d => d.properties.name);
  }, [mapData, loading]);

  if (loading) {
    return <p className="text-gray-300">Loading Uganda Districts Map...</p>;
  }

  if (error) {
    return <p className="text-red-400">Error: {error}</p>;
  }

  return (
    <div className="relative">
      {/* Map */}
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        viewBox="0 0 800 600"
        className="w-full h-auto bg-gray-800 rounded-lg"
      />

      {/* Tooltip (React controlled) */}
      {tooltip.visible && (
        <div
          className="absolute bg-black text-white text-sm rounded px-3 py-2 pointer-events-none"
          style={{ top: tooltip.y + 10, left: tooltip.x + 10, zIndex: 1000 }}
        >
          <strong>{tooltip.district.name}</strong><br />
          Region: {tooltip.district.region}<br />
          Population: {tooltip.district.population.toLocaleString()}<br />
          Hospitals: {tooltip.district.hospitals}<br />
          Schools: {tooltip.district.schools}
        </div>
      )}
    </div>
  );
};

export default UgandaMap;