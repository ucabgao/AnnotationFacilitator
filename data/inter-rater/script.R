library(irr)
data = read.csv("aggregate.tsv", sep = "\t")
data[, "Earl"][data[, "Earl"] == "NotFound"] = "Undetectable"
data[, "Chris"][data[, "Chris"] == "Unanalysed"] = "Undetectable"
ratings = data[, c("Zheng", "Chris", "Earl")]
extraRatings = ratings
extraRatings["baseline"] = rep("Undetectable", dim(data)[1])
print(kappam.fleiss(ratings))
print(kappam.fleiss(extraRatings))

stringRatings = data.frame(Chris = lapply(ratings["Chris"], as.character),
	Earl = lapply(ratings["Earl"], as.character),
	Zheng = lapply(ratings["Zheng"], as.character))

print(sum(stringRatings["Chris"] == stringRatings["Earl"] & stringRatings["Chris"] == stringRatings["Zheng"]) / dim(ratings)[1])