import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { DateRange } from "react-day-picker"
import { getSearchNights } from "@/utils/siteCoordinates"

export interface ExploreSearchParams {
  destination: string
  dateRange?: DateRange
  guests: number
}

interface ExploreSearchContextValue {
  searchSubmitted: boolean
  destination: string
  dateRange: DateRange | undefined
  guests: number
  nights: number
  submitSearch: (params: ExploreSearchParams) => void
  updateTripDetails: (params: { dateRange?: DateRange; guests?: number }) => void
  resetSearch: () => void
}

const ExploreSearchContext = createContext<ExploreSearchContextValue | null>(null)

export function ExploreSearchProvider({ children }: { children: ReactNode }) {
  const [searchSubmitted, setSearchSubmitted] = useState(false)
  const [destination, setDestination] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)

  const nights = useMemo(() => getSearchNights(dateRange), [dateRange])

  const submitSearch = useCallback((params: ExploreSearchParams) => {
    setDestination(params.destination)
    setDateRange(params.dateRange)
    setGuests(params.guests)
    setSearchSubmitted(true)
  }, [])

  const updateTripDetails = useCallback((params: { dateRange?: DateRange; guests?: number }) => {
    if (params.dateRange !== undefined) setDateRange(params.dateRange)
    if (params.guests !== undefined) setGuests(Math.max(1, params.guests))
  }, [])

  const resetSearch = useCallback(() => {
    setSearchSubmitted(false)
    setDestination("")
    setDateRange(undefined)
    setGuests(1)
  }, [])

  const value = useMemo(
    () => ({
      searchSubmitted,
      destination,
      dateRange,
      guests,
      nights,
      submitSearch,
      updateTripDetails,
      resetSearch,
    }),
    [searchSubmitted, destination, dateRange, guests, nights, submitSearch, updateTripDetails, resetSearch]
  )

  return (
    <ExploreSearchContext.Provider value={value}>{children}</ExploreSearchContext.Provider>
  )
}

export function useExploreSearch() {
  const ctx = useContext(ExploreSearchContext)
  if (!ctx) {
    throw new Error("useExploreSearch must be used within ExploreSearchProvider")
  }
  return ctx
}
