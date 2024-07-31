export default (obj: any): obj is Blob => 'Blob' in window && obj instanceof Blob;
