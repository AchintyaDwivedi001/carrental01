"use client";
import React, { useState } from "react";
import { Form } from "./ui/form";
import DateTimeForm from "./DateTimeForm";
import { pickupTime } from "@/contants/appdata";
import SelectForm from "./SelectForm";
import { Country, State, City } from "country-state-city";
import CitySelect from "./CitySelect";
import dynamic from "next/dynamic";

const Map = dynamic(
  () => import("@/components/Map"),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">Loading Map...</div>
  }
);

const StepOne = ({ form }) => {
  const indiaStates = State.getStatesOfCountry("IN");

  const [sourceState, setSourceState] = useState(null);
  const [destState, setDestState] = useState(null);
  const [getSource, setSource] = useState(null);
  const [getDestination, setDestination] = useState(null);

  const activeSourceState = form.watch("sourceState") || sourceState;
  const activeDestState = form.watch("destinationState") || destState;
  const activeSourceCity = form.watch("source") || getSource;
  const activeDestCity = form.watch("destination") || getDestination;

  // 🌟 THE MAGIC FIX IS HERE 🌟
  const getIsoCode = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val.isoCode || val.value; 
    
    // Finds the state even if the dropdown gives us GPS coordinates!
    const found = indiaStates.find(s => 
      s.name === val || 
      s.isoCode === val || 
      `${s.latitude},${s.longitude}` === val
    );
    return found ? found.isoCode : null;
  };

  const sourceIso = getIsoCode(activeSourceState);
  const destIso = getIsoCode(activeDestState);

  const sourceCities = sourceIso ? City.getCitiesOfState("IN", sourceIso) : [];
  const destCities = destIso ? City.getCitiesOfState("IN", destIso) : [];

  console.log("🔍 State Value:", activeSourceState, "| 🗺️ ISO Found:", sourceIso, "| 🏙️ Cities Loaded:", sourceCities.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-10 md:mx-[10%] my-10">
      <Form {...form}>
        <form className="w-full bg-white p-5 shadow-md border">
          <DateTimeForm
            id="pickupdate"
            label="Pickup Date"
            control={form.control}
          />
          <SelectForm
            id="pickuptime"
            label="Pickup Time"
            placeholder="Set pickup time"
            list={pickupTime}
            control={form.control}
          />

          {/* --- SOURCE SECTION --- */}
          <CitySelect
            id="sourceState"
            label="Source State"
            placeholder="Select starting state"
            list={indiaStates}
            setValue={setSourceState} 
            control={form.control}
          />
          <CitySelect
            id="source"
            label="Source City"
            placeholder="Select your starting city"
            list={sourceCities}
            setValue={setSource}
            control={form.control}
          />

          {/* --- DESTINATION SECTION --- */}
          <CitySelect
            id="destinationState"
            label="Destination State"
            placeholder="Select ending state"
            list={indiaStates}
            setValue={setDestState}
            control={form.control}
          />
          <CitySelect
            id="destination"
            label="Destination City"
            placeholder="Select your ending city"
            list={destCities}
            setValue={setDestination}
            control={form.control}
          />

          <SelectForm
            id="persons"
            label="Persons"
            placeholder="Select Persons"
            list={[1, 2, 3, 4, 5, 6]}
            control={form.control}
          />
          <SelectForm
            id="transfertype"
            label="Transfer Type"
            placeholder="Select transfer type"
            list={["one way", "return"]}
            control={form.control}
          />
        </form>
      </Form>
      <div className="flex justify-start flex-col">
        <Map 
          key={activeSourceCity?.name || "empty-map"} 
          getSource={activeSourceCity} 
          getDestination={activeDestCity} 
        />
      </div>
    </div>
  );
};

export default StepOne;