import kagglehub

# path = kagglehub.dataset_download("arthurchongg/imdb-top-1000-movies", output_dir="./dbCSV")
path = kagglehub.dataset_download("moazeldsokyx/imdb-top-10000-movies-dataset", output_dir="./dbCSV")

print("Path to dataset files:", path)
