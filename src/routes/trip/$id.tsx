
import { createFileRoute } from '@tanstack/react-router'
import { $api } from '../__root';
import { FUTAR_API_VERSION } from '@/lib/constants';
import { useMemo } from 'react';
import { decode, encode } from "@googlemaps/polyline-codec";
import { MapRoute } from '@/components/ui/map';
import VehiclesLayer from '@/features/vehicles/vehicles';
import TripDetails from '@/features/trips/trip-details';
import StopsLayer from '@/features/stops/stops';

export const Route = createFileRoute('/trip/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { data } = $api.useQuery(
    "get",
    "/{dialect}/api/where/trip-details",
    {
      params: {
        path: {
          dialect: "otp"

        },
        query: {
          appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
          version: FUTAR_API_VERSION,
          key: import.meta.env.VITE_FUTAR_API_KEY,
          tripId: id
        }
      },
    },
    {
      refetchInterval: 10000,
      placeholderData: (prev) => prev
    }
  );

  const path: [number, number][] = useMemo(() => {
    const points = data?.data.entry.polyline?.points

    console.log(data)

    if (!points) {
      return []
    }

    const decoded = decode(points).map(((l) => l.reverse()))

    return decoded
  }, [data])



  return <>
    <MapRoute coordinates={path} color={`#${data?.data.entry.vehicle?.style?.icon.color ?? "888"}`} width={4} opacity={0.8} />
    <VehiclesLayer filter={['==', ['get', 'tripId'], id]} />
    { data && <TripDetails data={data?.data} /> }
  </>

}
