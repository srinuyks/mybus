/**
 * 
 */
package com.mybus.model;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

/**
 * @author  schanda on 02/13/16.
 *
 */
public class ServiceFare {

	@Getter
	@Setter
	private String sourceCityId;

	@Getter
	@Setter
	private String destinationCityId;
	
	@Getter
	@Setter
	private BigDecimal fare;
	
	@Getter
	@Setter
	private Time arrivalTime;
	
	@Getter
	@Setter
	private Time departureTime;
	
	@Getter
	@Setter
	private int journeyDuration;
	
	@Getter
	@Setter
	private boolean active;
}
