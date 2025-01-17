import { useMemo } from "react";
import countriesData from "../assets/traktamente-en.json";

const useUniqueCountries = () => {
  const uniqueCountries = useMemo(() => {
    const unique = Array.from(
      new Map(
        countriesData.map((item) => [item["country or territory"], item])
      ).values()
    );

    unique.sort((a, b) =>
      a["country or territory"].localeCompare(b["country or territory"])
    );

    return unique;
  }, []);

  return uniqueCountries;
};

export default useUniqueCountries;
