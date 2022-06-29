import { assetPrefix } from "../next.config"

export const handleRoute = (route: string) => {
    return assetPrefix ? `${assetPrefix}/${route}` : route   
}