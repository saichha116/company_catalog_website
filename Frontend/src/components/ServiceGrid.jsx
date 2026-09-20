import ServiceCard from "./ServiceCard";

function ServiceGrid({
    services = [],
    activeCategory = "All",
    searchTerm = "",
    limit,
    fromHome = false,
    wishlist = [],
    setWishlist,
}) {
    const search = searchTerm.trim().toLowerCase();

    const filteredServices = services.filter((service) => {
        const categoryMatch =
            activeCategory === "All" ||
            service.category === activeCategory;

        const serviceName =
            service.service_name || "";

        const category =
            service.category || "";

        const searchMatch =
            search === "" ||
            serviceName
                .toLowerCase()
                .includes(search) ||
            category
                .toLowerCase()
                .includes(search);

        return categoryMatch && searchMatch;
    });

    const displayedServices = limit
        ? filteredServices.slice(0, limit)
        : filteredServices;

    return (
        <section className="services">

            <div className="heading">

                {activeCategory === "All" ? (
                    <>
                        <p className="subtitle">
                            OUR SERVICES
                        </p>

                        <h2>
                            What We Offer
                        </h2>
                    </>
                ) : (
                    <>
                        <p className="subtitle">
                            {activeCategory}
                        </p>
                    </>
                )}

            </div>


            <div className="services-grid">

                {displayedServices.length > 0 ? (

                    displayedServices.map((service) => (

                        <ServiceCard
                            key={service.service_id}

                            id={service.service_id}

                            image={
                                service.image
                                    ? `http://localhost:5000/uploads/${service.image}`
                                    : "/images/service-placeholder.jpg"
                            }

                            title={
                                service.service_name
                            }

                            category={
                                service.category
                            }

                            description={
                                service.description
                            }

                            fromHome={
                                fromHome
                            }

                            wishlist={
                                wishlist
                            }

                            setWishlist={
                                setWishlist
                            }
                        />

                    ))

                ) : (

                    <p className="no-services">
                        No services found.
                    </p>

                )}

            </div>

        </section>
    );
}

export default ServiceGrid;