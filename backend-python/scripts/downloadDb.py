import kagglehub

# path = kagglehub.dataset_download("arthurchongg/imdb-top-1000-movies", output_dir="./dbCSV")
path = kagglehub.dataset_download("moazeldsokyx/imdb-top-10000-movies-dataset", output_dir="./dbCSV")


# this one has posters link but no actor name 1000 movie
# path = kagglehub.dataset_download("harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows")


print("Path to dataset files:", path)
