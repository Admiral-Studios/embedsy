import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

class AzureBlobService {
  private static instance: ContainerClient

  public static getInstance(): ContainerClient {
    if (!AzureBlobService.instance) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.NEXT_PUBLIC_AZURE_STORAGE_CONNECTION_STRING ?? ''
      )
      AzureBlobService.instance = blobServiceClient.getContainerClient(
        process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME ?? ''
      )
    }

    return AzureBlobService.instance
  }
}

export default AzureBlobService
